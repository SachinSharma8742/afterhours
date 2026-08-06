"use client";

import { useState } from "react";
import { useAuth } from "../../../hooks/use-auth";
import { useToast } from "../../../hooks/use-toast";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { User, Mail, Phone, Shield, Save } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.user_metadata?.full_name || "Alex Rivera");
  const [email, setEmail] = useState(user?.email || "alex@afterhours.live");
  const [phone, setPhone] = useState("+1 (555) 019-2834");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated.",
        type: "success",
      });
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-extrabold text-white">Account Settings</h1>
        <p className="text-sm text-slate-400">Manage your profile details and preferences.</p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl flex flex-col gap-6 shadow-2xl">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
            {name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{name}</h3>
            <p className="text-xs text-slate-400">{email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            icon={User}
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            icon={Mail}
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Input
          icon={Phone}
          label="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Button type="submit" variant="glow" size="md" isLoading={isSaving} className="self-end mt-4">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </form>
    </div>
  );
}
