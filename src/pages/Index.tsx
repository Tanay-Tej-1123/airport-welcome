import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Scan, CheckCircle2, XCircle, User } from "lucide-react";
import { Member } from "@/lib/data";
import { TierBadge } from "@/components/MemberCard";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";

type ScanState = "idle" | "scanning" | "recognized" | "denied";

const RecognitionPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [matchedMember, setMatchedMember] = useState<Member | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [members, setMembers] = useState<Member[]>([]);

  // Fetch registered members from database
  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase.from("members").select("*");
      if (data) setMembers(data);
    };
    fetchMembers();
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch {
      console.error("Camera access denied");
    }
  }, []);

  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
    setCameraActive(false);
    setScanState("idle");
    setMatchedMember(null);
  }, []);

  const simulateScan = useCallback(() => {
    if (members.length === 0) {
      setScanState("denied");
      setConfidence(0);
      return;
    }

    setScanState("scanning");
    setMatchedMember(null);

    setTimeout(async () => {
      // Pick a random registered member (simulating face match)
      const isMatch = Math.random() > 0.2;
      if (isMatch && members.length > 0) {
        const member = members[Math.floor(Math.random() * members.length)];
        const conf = 92 + Math.random() * 7;
        setConfidence(Math.round(conf * 10) / 10);
        setMatchedMember(member);
        setScanState("recognized");

        // Update last_access in DB
        await supabase.from("members").update({ last_access: new Date().toISOString() }).eq("id", member.id);
      } else {
        setConfidence(Math.round((20 + Math.random() * 20) * 10) / 10);
        setScanState("denied");
      }
    }, 2500);
  }, [members]);

  useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Face Recognition Entry</h1>
          <p className="text-muted-foreground mt-1">Real-time premium member verification · {members.length} members registered</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="relative aspect-video bg-muted flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`} />
                
                {!cameraActive && (
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center mx-auto">
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm">Camera feed inactive</p>
                  </div>
                )}

                {scanState === "scanning" && cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-primary rounded-2xl relative overflow-hidden pulse-gold">
                      <div className="absolute inset-x-0 h-0.5 gold-gradient scan-line" />
                    </div>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-panel rounded-full px-4 py-2">
                      <p className="text-xs text-primary font-medium animate-pulse">Scanning face...</p>
                    </div>
                  </div>
                )}

                {scanState === "recognized" && cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                    <div className="w-48 h-48 border-2 border-success rounded-2xl flex items-center justify-center fade-in">
                      <CheckCircle2 className="w-16 h-16 text-success" />
                    </div>
                  </div>
                )}

                {scanState === "denied" && cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                    <div className="w-48 h-48 border-2 border-destructive rounded-2xl flex items-center justify-center fade-in">
                      <XCircle className="w-16 h-16 text-destructive" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 flex items-center gap-3 border-t border-border">
                {!cameraActive ? (
                  <button onClick={startCamera} className="gold-gradient text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                    Activate Camera
                  </button>
                ) : (
                  <>
                    <button
                      onClick={simulateScan}
                      disabled={scanState === "scanning"}
                      className="gold-gradient text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                      <Scan className="w-4 h-4" />
                      {scanState === "scanning" ? "Scanning..." : "Scan Face"}
                    </button>
                    <button onClick={stopCamera} className="bg-secondary text-secondary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
                      Stop Camera
                    </button>
                  </>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${cameraActive ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
                  <span className="text-xs text-muted-foreground">{cameraActive ? "Live" : "Offline"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recognition Result */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Scan Result</h2>

              {scanState === "idle" && (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {members.length === 0 ? "No members registered yet. Add members first." : "Awaiting scan"}
                  </p>
                </div>
              )}

              {scanState === "scanning" && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
                  <p className="text-sm text-primary">Analyzing...</p>
                </div>
              )}

              {scanState === "recognized" && matchedMember && (
                <div className="fade-in space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={matchedMember.photo_url || "/placeholder.svg"} alt={matchedMember.name} className="w-16 h-16 rounded-full object-cover border-2 border-success" />
                      <CheckCircle2 className="w-5 h-5 text-success absolute -bottom-1 -right-1 bg-card rounded-full" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground">{matchedMember.name}</h3>
                      <TierBadge tier={matchedMember.tier} />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="text-success font-medium">{confidence}%</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Passport</span>
                      <span className="text-foreground font-mono text-xs">{matchedMember.passport_number}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Nationality</span>
                      <span className="text-foreground">{matchedMember.nationality}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Flights</span>
                      <span className="text-foreground">{matchedMember.flights}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Status</span>
                      <span className="text-success capitalize">{matchedMember.status}</span>
                    </div>
                  </div>

                  <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-center">
                    <p className="text-success text-sm font-medium">✓ Access Granted</p>
                  </div>
                </div>
              )}

              {scanState === "denied" && (
                <div className="fade-in space-y-4 text-center py-4">
                  <XCircle className="w-12 h-12 text-destructive mx-auto" />
                  <div>
                    <p className="text-destructive font-medium">No Match Found</p>
                    <p className="text-xs text-muted-foreground mt-1">Confidence: {confidence}%</p>
                  </div>
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-destructive text-sm font-medium">✗ Access Denied</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Registered", value: String(members.length), color: "text-primary" },
                { label: "Max Capacity", value: "20", color: "text-foreground" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-xl p-3 text-center">
                  <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecognitionPage;
