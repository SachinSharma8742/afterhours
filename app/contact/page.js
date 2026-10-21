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
    <div className="flex flex-col min-h-screen text-[#f7f1e5] pt-24 pb-20 font-montserrat">
      
      {/* Hero Header */}
      <section className="relative py-14 px-4 border-b border-[#e5c997]/15 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
          <img
            src="/images/logo.png?v=afterhours-v5"
            alt="AfterHours Support"
            className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-xl border border-[#e5c997]/40 shadow-sm mb-1"
          />
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#e5c997]">// GET IN TOUCH</span>
          <h1 className="font-bebas text-4xl sm:text-6xl tracking-wider uppercase text-[#f7f1e5]">
            CONTACT <span className="text-[#e5c997]">SUPPORT</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9c8e82] max-w-md leading-relaxed font-normal">
            Have a question about your pass, entry guidelines, or VIP tables? Reach out to our direct event support desk.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-4 py-14 w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Info Column */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-bebas text-3xl uppercase tracking-wider text-[#f7f1e5] mb-1.5">
              WE&apos;RE HERE TO HELP
            </h2>
            <p className="text-xs text-[#9c8e82] leading-relaxed font-normal">
              Our direct customer concierge team typically responds within 2 hours.
            </p>
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-4 p-4 sm:p-5 bg-[#161013] border border-[#e5c997]/15 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-[#20151a] border border-[#e5c997]/25 flex items-center justify-center text-[#e5c997] shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#9c8e82] tracking-widest block">EMAIL US</span>
                <a href="mailto:afterhourss467@gmail.com" className="text-sm font-semibold text-[#f7f1e5] hover:text-[#e5c997] transition-colors">
                  afterhourss467@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 sm:p-5 bg-[#161013] border border-[#e5c997]/15 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-[#20151a] border border-[#e5c997]/25 flex items-center justify-center text-[#e5c997] shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono uppercase text-[#9c8e82] tracking-widest block">CALL & WHATSAPP</span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <a href="tel:+919116647082" className="text-sm font-semibold text-[#f7f1e5] hover:text-[#e5c997] transition-colors">
                    +91 91 166 470 82
                  </a>
                  <span className="hidden sm:inline text-gray-600">|</span>
                  <a href="tel:+919950221881" className="text-sm font-semibold text-[#f7f1e5] hover:text-[#e5c997] transition-colors">
                    +91 99502 21881
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Form Column */}
        <div className="p-6 sm:p-8 bg-[#161013] border border-[#e5c997]/20 rounded-xl shadow-sm">
          {submitted ? (
            <div className="flex flex-col items-center justify-center text-center py-10 gap-3">
              <CheckCircle2 className="w-12 h-12 text-[#e5c997]" />
              <h3 className="font-bebas text-3xl text-[#f7f1e5]">MESSAGE SENT SUCCESSFULLY</h3>
              <p className="text-xs text-[#9c8e82] max-w-xs font-normal">
                Thank you for reaching out. An AfterHours support representative will contact you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <h3 className="font-bebas text-2xl tracking-wider text-[#f7f1e5] uppercase">SEND A MESSAGE</h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#9c8e82]">YOUR NAME</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full px-3.5 py-2.5 bg-[#0e0a0c] border border-[#e5c997]/20 focus:border-[#e5c997] rounded-lg text-xs text-[#f7f1e5] placeholder-gray-600 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#9c8e82]">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 bg-[#0e0a0c] border border-[#e5c997]/20 focus:border-[#e5c997] rounded-lg text-xs text-[#f7f1e5] placeholder-gray-600 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#9c8e82]">MESSAGE</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we assist you?"
                  className="w-full px-3.5 py-2.5 bg-[#0e0a0c] border border-[#e5c997]/20 focus:border-[#e5c997] rounded-lg text-xs text-[#f7f1e5] placeholder-gray-600 focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="btn-gold-luxury py-3 text-xs flex items-center justify-center gap-2 mt-1 w-full"
              >
                <span>SEND MESSAGE</span>
                <Send className="w-3.5 h-3.5 ml-1" />
              </button>
            </form>
          )}
        </div>

      </section>

    </div>
  );
}
