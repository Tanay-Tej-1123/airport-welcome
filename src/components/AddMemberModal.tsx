import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Scan, CheckCircle2, X, User } from "lucide-react";
import { Member } from "@/lib/data";

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (member: Member) => void;
}

type Step = "camera" | "scanning" | "captured" | "form";

const AddMemberModal = ({ open, onClose, onAdd }: AddMemberModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState<Step>("camera");
  const [capturedPhoto, setCapturedPhoto] = useState<string>("");
  const [form, setForm] = useState({ name: "", email: "", tier: "Silver" as Member["tier"], passportNumber: "", nationality: "" });

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 480, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      console.error("Camera access denied");
    }
  }, []);

  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
  }, []);

  useEffect(() => {
    if (open) {
      setStep("camera");
      setCapturedPhoto("");
      setForm({ name: "", email: "", tier: "Silver", passportNumber: "", nationality: "" });
      setTimeout(() => startCamera(), 300);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [open, startCamera, stopCamera]);

  const handleScan = () => {
    setStep("scanning");
    setTimeout(() => {
      // Capture frame from video
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = 480;
        canvas.height = 480;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 480, 480);
          const dataUrl = canvas.toDataURL("image/jpeg");
          setCapturedPhoto(dataUrl);
        }
      }
      stopCamera();
      setStep("captured");
      // Auto-advance to form after brief delay
      setTimeout(() => setStep("form"), 1200);
    }, 2500);
  };

  const handleSubmit = () => {
    if (!form.name || !form.email) return;
    const newMember: Member = {
      id: Date.now().toString(),
      name: form.name,
      email: form.email,
      tier: form.tier,
      memberSince: new Date().toISOString().split("T")[0],
      flights: 0,
      photoUrl: capturedPhoto,
      passportNumber: form.passportNumber,
      nationality: form.nationality,
      status: "active",
    };
    onAdd(newMember);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm fade-in">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {step === "form" ? "Member Details" : "Face Enrollment"}
          </h2>
          <button onClick={() => { stopCamera(); onClose(); }} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera / Scan / Form */}
        <div className="p-6">
          {(step === "camera" || step === "scanning") && (
            <div className="space-y-4">
              <div className="relative aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden bg-muted">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                
                {/* Face guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`w-48 h-48 rounded-full border-2 ${step === "scanning" ? "border-primary pulse-gold" : "border-muted-foreground/40"} transition-colors`}>
                    {step === "scanning" && (
                      <div className="absolute inset-x-0 h-0.5 gold-gradient scan-line rounded-full" />
                    )}
                  </div>
                </div>

                {step === "scanning" && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-panel rounded-full px-4 py-2">
                    <p className="text-xs text-primary font-medium animate-pulse">Scanning face...</p>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <p className="text-center text-sm text-muted-foreground">
                {step === "scanning" ? "Analyzing facial features..." : "Position your face within the circle"}
              </p>

              <button
                onClick={handleScan}
                disabled={step === "scanning"}
                className="w-full gold-gradient text-primary-foreground py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Scan className="w-4 h-4" />
                {step === "scanning" ? "Scanning..." : "Scan & Capture Face"}
              </button>
            </div>
          )}

          {step === "captured" && (
            <div className="text-center space-y-4 fade-in py-4">
              <div className="relative w-32 h-32 mx-auto">
                <img src={capturedPhoto} alt="Captured" className="w-full h-full rounded-full object-cover border-2 border-success" />
                <CheckCircle2 className="w-8 h-8 text-success absolute -bottom-1 -right-1 bg-card rounded-full" />
              </div>
              <p className="text-success font-medium">Face captured successfully!</p>
              <p className="text-xs text-muted-foreground">Preparing enrollment form...</p>
            </div>
          )}

          {step === "form" && (
            <div className="space-y-4 fade-in">
              {/* Photo preview */}
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                {capturedPhoto ? (
                  <img src={capturedPhoto} alt="Member" className="w-16 h-16 rounded-full object-cover border-2 border-success" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="text-sm text-success font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Face enrolled
                  </p>
                  <p className="text-xs text-muted-foreground">Complete the details below</p>
                </div>
              </div>

              {/* Form fields */}
              {[
                { label: "Full Name", key: "name", placeholder: "e.g. Alexandra Chen", type: "text" },
                { label: "Email", key: "email", placeholder: "e.g. a.chen@email.com", type: "email" },
                { label: "Passport Number", key: "passportNumber", placeholder: "e.g. E8291034", type: "text" },
                { label: "Nationality", key: "nationality", placeholder: "e.g. Singapore", type: "text" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              ))}

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Membership Tier</label>
                <div className="flex gap-2">
                  {(["Platinum", "Gold", "Silver"] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setForm((f) => ({ ...f, tier }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        form.tier === tier
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!form.name || !form.email}
                className="w-full gold-gradient text-primary-foreground py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
              >
                Register Member
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
