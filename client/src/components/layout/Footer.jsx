import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { BRAND } from '@/lib/constants';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-primary-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container-luxury py-12">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-display text-2xl mb-2">Stay in the Loop</h3>
            <p className="text-white/60 text-sm mb-6">
              First dibs on new drops, offers, and scent tips. No spam, just the good stuff.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-btn bg-white/5 border border-white/10 text-white placeholder-white/40
                         focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                required
              />
              <button
                type="submit"
                className="btn-accent whitespace-nowrap"
              >
                {subscribed ? '✓ Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-luxury py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <span className="text-primary-900 font-display text-sm font-bold">A</span>
              </div>
              <span className="font-display text-lg font-bold tracking-wider">{BRAND.name}</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              Premium Indian-made fragrances that get people asking "what are you wearing?"
            </p>
            <div className="flex gap-3">
              {['Instagram', 'Twitter', 'Facebook'].map((social, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-xs
                           hover:border-accent hover:bg-accent/10 transition-all duration-300 text-white/60"
                >
                  {social[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-base font-semibold mb-4 text-accent">Quick Links</h4>
            <div className="space-y-2.5">
              {['Shop All', 'Find Your Scent', 'About Us', 'Contact'].map((item) => (
                <Link
                  key={item}
                  to={item === 'Shop All' ? '/shop' : item === 'Find Your Scent' ? '/quiz' : `/${item.toLowerCase().replace(/ /g, '-')}`}
                  className="block text-sm text-white/50 hover:text-accent transition-colors duration-300"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-display text-base font-semibold mb-4 text-accent">Help</h4>
            <div className="space-y-2.5">
              {['Track Order', 'Returns & Refunds', 'Shipping Policy', 'Privacy Policy', 'Terms & Conditions'].map((item) => (
                <Link
                  key={item}
                  to="#"
                  className="block text-sm text-white/50 hover:text-accent transition-colors duration-300"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-base font-semibold mb-4 text-accent">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <Mail size={16} className="text-accent mt-0.5 shrink-0" />
                <span className="text-sm text-white/50">hello@avenues.com</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone size={16} className="text-accent mt-0.5 shrink-0" />
                <span className="text-sm text-white/50">+91 98765 43210</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-accent mt-0.5 shrink-0" />
                <span className="text-sm text-white/50">Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container-luxury py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Crafted with passion in India.
          </p>
        </div>
      </div>
    </footer>
  );
}
