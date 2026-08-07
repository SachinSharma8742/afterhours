"use client";

import { useState } from "react";
import { Mail, Phone, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pt-24 pb-20 font-montserrat">
      
      {/* Hero Header */}
      <section className="relative py-16 px-4 border-b border-[#c8102e]/40 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
          <span className="text-xs font-black uppercase tracking-[0.35em] text-[#c8102e]">// GET IN TOUCH</span>
          <h1 className="font-bebas text-5xl sm:text-7xl tracking-wider uppercase">
            CONTACT <span className="text-[#c8102e] red-text-glow">SUPPORT</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md leading-relaxed font-medium">
            Have a question about your ticket pass, venue entry, or group bookings? Reach out to our 24/7 team.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-16 w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Info Column */}
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="font-bebas text-4xl uppercase tracking-wider text-white mb-2">
              WE&apos;RE HERE TO HELP
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Our direct customer support team responds within 2 hours.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 p-5 bg-black border border-[#c8102e]/40 border-l-4 border-l-[#c8102e]">
              <Mail className="w-6 h-6 text-[#c8102e] shrink-0" />
              <div>
                <span className="text-[10px] font-mono uppercase text-gray-500 tracking-widest block">EMAIL US</span>
                <a href="mailto:afterhourss467@gmail.com" className="text-sm sm:text-base font-bold text-white hover:text-[#c8102e] transition-colors">
                  afterhourss467@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 bg-black border border-[#c8102e]/40 border-l-4 border-l-[#c8102e]">
              <Phone className="w-6 h-6 text-[#c8102e] shrink-0" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-gray-500 tracking-widest block">CALL & WHATSAPP SUPPORT</span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <a href="tel:+919116647082" className="text-sm sm:text-base font-bold text-white hover:text-[#c8102e] transition-colors">
                    +91 91 166 470 82
                  </a>
                  <span className="hidden sm:inline text-gray-600">|</span>
                  <a href="tel:+919950221881" className="text-sm sm:text-base font-bold text-white hover:text-[#c8102e] transition-colors">
                    +91 99502 21881
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Form Column */}
        <div className="p-8 bg-black border-2 border-[#c8102e] box-red-glow">
          {submitted ? (
            <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
              <CheckCircle2 className="w-14 h-14 text-emerald-400" />
              <h3 className="font-bebas text-4xl text-white">MESSAGE SENT SUCCESSFULLY!</h3>
              <p className="text-xs text-gray-400 max-w-xs font-medium">
                Thank you for contacting AfterHours support. We will get back to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <h3 className="font-bebas text-3xl tracking-wider text-white uppercase">SEND A MESSAGE</h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">YOUR NAME</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 focus:border-[#c8102e] text-xs text-white placeholder-gray-600 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 focus:border-[#c8102e] text-xs text-white placeholder-gray-600 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">MESSAGE</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we assist you?"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 focus:border-[#c8102e] text-xs text-white placeholder-gray-600 focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="btn-sharp-red py-4 text-xs flex items-center justify-center gap-2 mt-2"
              >
                <span>SEND MESSAGE</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

      </section>

    </div>
  );
}
