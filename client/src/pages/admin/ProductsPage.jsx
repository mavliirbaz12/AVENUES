import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit, Trash2, X, RefreshCw, Upload, Link as LinkIcon, Loader, ChevronDown } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import axios from 'axios';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', slug: '', categoryLabel: 'eau de parfum for men',
  heroTagline: '', tagline: '', oneLiner: '',
  shortDescription: '', longDescription: '', description: '',
  mrp: '', sellingPrice: '', stock: '', lowStockThreshold: '10',
  color: '#D4AF37', tags: '', images: [],
  topNotes: '', heartNotes: '', baseNotes: '',
  longevity: '8-10', projection: 'moderate', size: '50ml', fragranceFor: 'men',
  benefits: ['', '', '', '', ''],
  faqs: [
    { q: '', a: '' },
    { q: '', a: '' },
    { q: '', a: '' },
    { q: '', a: '' },
  ],
  occasions: '', type: 'Eau De Parfum (EDP)',
  usageInstructions: 'Spray on pulse points — wrists, neck, behind the ears. Best on moisturized skin.',
};

function TagChipInput({ label, value, onChange, placeholder }) {
  const [input, setInput] = useState('');
  const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];

  const addTag = (text) => {
    const newTags = [...tags, text.trim()].filter(Boolean);
    onChange(newTags.join(', '));
    setInput('');
  };

  const removeTag = (i) => {
    onChange(tags.filter((_, idx) => idx !== i).join(', '));
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
  };

  return (
    <div>
      <label className="block text-sm text-white/60 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/15 text-accent text-xs font-medium rounded-full border border-accent/20">
            {tag}
            <button type="button" onClick={() => removeTag(i)} className="hover:text-white transition-colors">
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) addTag(input); }}
        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50"
        placeholder={placeholder || `Type and press Enter`}
      />
    </div>
  );
}

function ImageUploadBox({ images, onChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append('images', f));
      const { data } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange([...images, ...data.urls]);
      toast.success(`${data.urls.length} image(s) uploaded!`);
    } catch {
      toast.error('Upload failed. Try a smaller image.');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlAdd = () => {
    const url = prompt('Or paste an image URL:');
    if (url?.trim()) onChange([...images, url.trim()]);
  };

  const removeImage = (i) => onChange(images.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <label className="block text-sm text-white/60 mb-1.5">Product Images</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200',
          dragOver ? 'border-accent bg-accent/10 scale-[1.01]' : 'border-white/15 hover:border-accent/50 hover:bg-white/3'
        )}
      >
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        {uploading ? (
          <><Loader size={24} className="text-accent animate-spin" /><p className="text-sm text-white/50">Uploading...</p></>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center"><Upload size={20} className="text-accent" /></div>
            <div className="text-center">
              <p className="text-sm text-white font-medium">Click or drag photos here</p>
              <p className="text-xs text-white/35 mt-1">JPG, PNG, WEBP up to 5MB each</p>
            </div>
          </>
        )}
      </div>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group bg-[#0A0A0A]">
              <img src={img} alt="" className="w-full h-full object-contain p-1" onError={(e) => { e.target.src = '/logo.png'; }} />
              <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <X size={16} className="text-white" />
              </button>
              {i === 0 && <span className="absolute bottom-1 left-1 text-[8px] bg-accent text-[#050505] font-bold px-1.5 py-0.5 rounded">Main</span>}
            </div>
          ))}
        </div>
      )}
      <button type="button" onClick={handleUrlAdd} className="flex items-center gap-2 text-xs text-white/40 hover:text-accent transition-colors">
        <LinkIcon size={12} /> Add by URL instead
      </button>
    </div>
  );
}

function ProductModal({ product, onClose, onSave }) {
  const isEdit = !!product?._id;
  const [form, setForm] = useState(isEdit ? {
    name: product.name || '',
    slug: product.slug || '',
    categoryLabel: product.categoryLabel || 'eau de parfum for men',
    heroTagline: product.heroTagline || '',
    tagline: product.tagline || '',
    oneLiner: product.oneLiner || '',
    shortDescription: product.shortDescription || '',
    longDescription: product.longDescription || '',
    description: product.description || '',
    mrp: product.pricing?.mrp || '',
    sellingPrice: product.pricing?.sellingPrice || '',
    stock: product.stock?.quantity ?? '',
    lowStockThreshold: product.stock?.lowStockThreshold ?? 10,
    color: product.color || '#D4AF37',
    tags: (product.tags || []).join(', '),
    images: product.images || [],
    topNotes: (product.fragrance?.topNotes || []).join(', '),
    heartNotes: (product.fragrance?.heartNotes || []).join(', '),
    baseNotes: (product.fragrance?.baseNotes || []).join(', '),
    longevity: product.fragrance?.longevity || '8-10',
    projection: product.fragrance?.projection || 'moderate',
    size: product.fragrance?.size || '50ml',
    fragranceFor: product.fragrance?.for || 'men',
    benefits: product.benefits?.length ? product.benefits : [''],
    faqs: product.faqs?.length ? product.faqs : [{ q: '', a: '' }],
    occasions: (product.occasions || []).join(', '),
    type: product.type || 'Eau De Parfum (EDP)',
    usageInstructions: product.usageInstructions || '',
  } : EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.sellingPrice) {
      toast.error('Name and Selling Price are required');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        categoryLabel: form.categoryLabel,
        heroTagline: form.heroTagline,
        tagline: form.tagline,
        oneLiner: form.oneLiner,
        shortDescription: form.shortDescription,
        longDescription: form.longDescription,
        description: form.description || form.shortDescription,
        mrp: Number(form.mrp) || 0,
        sellingPrice: Number(form.sellingPrice),
        stock: Number(form.stock) || 0,
        lowStockThreshold: Number(form.lowStockThreshold) || 10,
        color: form.color,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        images: form.images,
        fragrance: {
          topNotes: form.topNotes.split(',').map(t => t.trim()).filter(Boolean),
          heartNotes: form.heartNotes.split(',').map(t => t.trim()).filter(Boolean),
          baseNotes: form.baseNotes.split(',').map(t => t.trim()).filter(Boolean),
          longevity: form.longevity,
          projection: form.projection,
          size: form.size,
          for: form.fragranceFor,
        },
        benefits: form.benefits.filter(b => b.trim()),
        faqs: form.faqs.filter(f => f.q.trim()),
        occasions: form.occasions.split(',').map(t => t.trim()).filter(Boolean),
        type: form.type,
        usageInstructions: form.usageInstructions,
      };

      if (isEdit) {
        await axios.put(`/api/products/${product._id}`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('avenues_token')}` } });
        toast.success('Product updated!');
      } else {
        await axios.post('/api/products', payload, { headers: { Authorization: `Bearer ${localStorage.getItem('avenues_token')}` } });
        toast.success('Product added to database!');
      }
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const discount = form.mrp && form.sellingPrice
    ? Math.round(((form.mrp - form.sellingPrice) / form.mrp) * 100)
    : 0;

  const updateBenefit = (i, val) => {
    const next = [...form.benefits];
    next[i] = val;
    setForm({ ...form, benefits: next });
  };
  const addBenefit = () => setForm({ ...form, benefits: [...form.benefits, ''] });
  const removeBenefit = (i) => setForm({ ...form, benefits: form.benefits.filter((_, idx) => idx !== i) });

  const updateFaq = (i, key, val) => {
    const next = [...form.faqs];
    next[i] = { ...next[i], [key]: val };
    setForm({ ...form, faqs: next });
  };
  const addFaq = () => setForm({ ...form, faqs: [...form.faqs, { q: '', a: '' }] });
  const removeFaq = (i) => setForm({ ...form, faqs: form.faqs.filter((_, idx) => idx !== i) });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#111111] border border-white/10 rounded-2xl p-6 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold text-white">{isEdit ? 'Edit Product' : 'Add New Product'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── SECTION: Basic Info ── */}
          <div>
            <p className="text-accent text-[10px] font-bold tracking-[0.2em] uppercase mb-3">Basic Info</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Product Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50"
                    placeholder="Avenues Midnight Oud" required />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Category Label</label>
                  <input value={form.categoryLabel} onChange={e => setForm({ ...form, categoryLabel: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50"
                    placeholder="eau de parfum for men" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Hero Tagline <span className="text-white/30 text-xs">(ALL CAPS — shown on PDP)</span></label>
                <input value={form.heroTagline} onChange={e => setForm({ ...form, heroTagline: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50"
                  placeholder="RICH. BOLD. UNFORGETTABLE." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Tagline <span className="text-white/30 text-xs">(italic on PDP)</span></label>
                  <input value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50"
                    placeholder="Rich. Bold. Unforgettable." />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">One-Liner <span className="text-white/30 text-xs">(short punchy hook)</span></label>
                  <input value={form.oneLiner} onChange={e => setForm({ ...form, oneLiner: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50"
                    placeholder="The one they remember the next morning." />
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION: Descriptions ── */}
          <div>
            <p className="text-accent text-[10px] font-bold tracking-[0.2em] uppercase mb-3">Descriptions</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Short Description <span className="text-white/30 text-xs">(1-2 sentences — shown on cards and PDP)</span></label>
                <input value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50"
                  placeholder="Apple and cinnamon that hit warm. Vanilla and amber that stay. Night in a bottle." />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Long Description <span className="text-white/30 text-xs">(full product story — shown in PDP accordion. Write 3-5 sentences about the scent journey: opening, heart, base.)</span></label>
                <textarea value={form.longDescription} onChange={e => setForm({ ...form, longDescription: e.target.value })} rows={5}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50 resize-none"
                  placeholder="AVENUES [NAME] opens with [top notes] that hit you first — [adjective], [adjective]. Then [heart notes] softens the edge, adding [what it adds]. Then the base settles in — [base notes] wrap around you like [metaphor]. [X] hours of wear. [Closing hook.]" />
              </div>
            </div>
          </div>

          {/* ── SECTION: Pricing ── */}
          <div>
            <p className="text-accent text-[10px] font-bold tracking-[0.2em] uppercase mb-3">Pricing & Stock</p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">MRP (₹)</label>
                <input type="number" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50" placeholder="1499" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Sale Price (₹) *</label>
                <input type="number" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-accent/30 rounded-lg px-4 py-2.5 text-sm text-accent focus:outline-none focus:border-accent" placeholder="1199" required />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Discount</label>
                <div className="w-full bg-[#0A0A0A] border border-white/5 rounded-lg px-4 py-2.5 text-sm">
                  {discount > 0 ? <span className="text-green-400 font-bold">{discount}% OFF</span> : <span className="text-white/30">Auto calculated</span>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Stock Quantity</label>
                <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50" placeholder="50" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Low Stock Alert At</label>
                <input type="number" value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50" placeholder="10" />
              </div>
            </div>
          </div>

          {/* ── SECTION: Fragrance ── */}
          <div>
            <p className="text-accent text-[10px] font-bold tracking-[0.2em] uppercase mb-3">Fragrance Notes <span className="text-white/30 text-xs">(Type and press Enter to add each note as a chip)</span></p>
            <div className="space-y-3">
              <TagChipInput label="Top Notes" value={form.topNotes} onChange={v => setForm({ ...form, topNotes: v })} placeholder="Bergamot, Lavender, Citrus" />
              <TagChipInput label="Heart Notes" value={form.heartNotes} onChange={v => setForm({ ...form, heartNotes: v })} placeholder="Orange Blossom, Geranium, Rose" />
              <TagChipInput label="Base Notes" value={form.baseNotes} onChange={v => setForm({ ...form, baseNotes: v })} placeholder="Amber, Cedarwood, Vanilla" />
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Longevity</label>
                  <input value={form.longevity} onChange={e => setForm({ ...form, longevity: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50" placeholder="8-10" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Projection</label>
                  <select value={form.projection} onChange={e => setForm({ ...form, projection: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50">
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="strong">Strong</option>
                    <option value="very-strong">Very Strong</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Size</label>
                  <input value={form.size} onChange={e => setForm({ ...form, size: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50" placeholder="50ml" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">For</label>
                  <select value={form.fragranceFor} onChange={e => setForm({ ...form, fragranceFor: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50">
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION: Benefits ── */}
          <div>
            <p className="text-accent text-[10px] font-bold tracking-[0.2em] uppercase mb-3">Benefits <span className="text-white/30 text-xs">(Write 4-5 punchy benefit lines. Mix facts with personality.)</span></p>
            <div className="space-y-2">
              {form.benefits.map((b, i) => (
                <div key={i} className="flex gap-2">
                  <input value={b} onChange={e => updateBenefit(i, e.target.value)}
                    className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50"
                    placeholder={['10-12+ hours. Still there at 2 AM. We tested it.', '25% oil concentration. This is not a body spray.', 'Built on real customer feedback, not boardroom guesses.', 'The kind that gets you asked "What are you wearing?"', 'Premium ingredients, honest pricing. No shortcuts.'][i] || `Benefit ${i + 1}`} />
                  {form.benefits.length > 1 && (
                    <button type="button" onClick={() => removeBenefit(i)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"><X size={16} /></button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addBenefit} className="flex items-center gap-2 text-xs text-white/40 hover:text-accent transition-colors"><Plus size={14} /> Add benefit</button>
            </div>
          </div>

          {/* ── SECTION: FAQs ── */}
          <div>
            <p className="text-accent text-[10px] font-bold tracking-[0.2em] uppercase mb-3">FAQs <span className="text-white/30 text-xs">(Write 3-4 Q&As customers actually ask)</span></p>
            <div className="space-y-3">
              {form.faqs.map((faq, i) => (
                <div key={i} className="bg-[#0A0A0A] border border-white/10 rounded-lg p-3 space-y-2">
                  <div className="flex gap-2">
                    <input value={faq.q} onChange={e => updateFaq(i, 'q', e.target.value)}
                      className="flex-1 bg-transparent border-b border-white/10 px-2 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50"
                      placeholder={['How long does it last?', 'Is this good for daily wear?', 'What season is this for?', 'Will I get compliments?'][i] || 'Question'} />
                    {form.faqs.length > 1 && (
                      <button type="button" onClick={() => removeFaq(i)} className="p-1 hover:bg-red-500/10 rounded text-red-400"><X size={14} /></button>
                    )}
                  </div>
                  <textarea value={faq.a} onChange={e => updateFaq(i, 'a', e.target.value)} rows={2}
                    className="w-full bg-transparent border border-white/5 rounded px-2 py-1.5 text-sm text-white/70 placeholder-white/30 focus:outline-none focus:border-accent/50 resize-none"
                    placeholder={['8-10 hours on skin. It is an EDP, not a body spray.', 'Perfect for the office, errands, lunch meetings.', 'Year-round. The citrus works in summer, the base works in winter.', 'Let us just say we did not get 128 reviews by being forgettable.'][i] || 'Answer'} />
                </div>
              ))}
              <button type="button" onClick={addFaq} className="flex items-center gap-2 text-xs text-white/40 hover:text-accent transition-colors"><Plus size={14} /> Add FAQ</button>
            </div>
          </div>

          {/* ── SECTION: Details ── */}
          <div>
            <p className="text-accent text-[10px] font-bold tracking-[0.2em] uppercase mb-3">Details</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50">
                    <option>Eau De Parfum (EDP)</option>
                    <option>Eau De Toilette (EDT)</option>
                    <option>Parfum</option>
                    <option>Eau De Cologne (EDC)</option>
                  </select>
                </div>
                <TagChipInput label="Occasions" value={form.occasions} onChange={v => setForm({ ...form, occasions: v })} placeholder="Night Out, Dates, Parties" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Usage Instructions</label>
                <textarea value={form.usageInstructions} onChange={e => setForm({ ...form, usageInstructions: e.target.value })} rows={2}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50 resize-none"
                  placeholder="Spray on pulse points..." />
              </div>
            </div>
          </div>

          {/* ── SECTION: Media ── */}
          <div>
            <p className="text-accent text-[10px] font-bold tracking-[0.2em] uppercase mb-3">Media & Tags</p>
            <div className="space-y-3">
              <TagChipInput label="Tags" value={form.tags} onChange={v => setForm({ ...form, tags: v })} placeholder="Sweet, Spicy, Warm" />
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Card Accent Color</label>
                <div className="flex items-center gap-3 bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 h-[42px]">
                  <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="h-6 w-8 rounded bg-transparent border-0 cursor-pointer" />
                  <span className="text-sm text-white/60">{form.color}</span>
                  <div className="w-4 h-4 rounded-full ml-auto" style={{ backgroundColor: form.color }} />
                </div>
              </div>
              <ImageUploadBox images={form.images} onChange={(imgs) => setForm({ ...form, images: imgs })} />
            </div>
          </div>

          {/* Price Preview */}
          {form.sellingPrice && (
            <div className="bg-[#0A0A0A] border border-accent/20 rounded-xl p-4">
              <p className="text-xs text-white/40 mb-2">Price Preview on Store</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-accent">₹{Number(form.sellingPrice).toLocaleString('en-IN')}</span>
                {form.mrp && Number(form.mrp) > Number(form.sellingPrice) && (
                  <>
                    <span className="text-white/30 line-through text-lg">₹{Number(form.mrp).toLocaleString('en-IN')}</span>
                    {discount > 0 && <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">{discount}% OFF</span>}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-white/10">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-white/10 rounded-lg text-sm text-white/60 hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2.5 bg-accent text-[#050505] font-bold rounded-lg text-sm hover:bg-accent/90 transition-colors disabled:opacity-60">
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalProduct, setModalProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/products');
      setProducts(data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setModalProduct({}); setShowModal(true); };
  const openEdit = (p) => { setModalProduct(p); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setModalProduct(null); };

  const handleSaved = () => {
    closeModal();
    fetchProducts();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from the database?`)) return;
    try {
      await axios.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('avenues_token')}` } });
      setProducts(products.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Products</h2>
          <p className="text-sm text-white/60">{loading ? '...' : products.length} products in database</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchProducts} className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors"><RefreshCw size={16} /></button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-accent text-[#050505] font-semibold rounded-lg text-sm hover:bg-accent/90 transition-colors">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#111111] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50"
          placeholder="Search products..." />
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-white/60">Product</th>
                <th className="text-left py-3 px-4 font-medium text-white/60">Price</th>
                <th className="text-left py-3 px-4 font-medium text-white/60">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-white/60">Rating</th>
                <th className="text-left py-3 px-4 font-medium text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={5} className="py-4 px-4"><div className="h-5 bg-white/5 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : filtered.map((product) => {
                const qty = product.stock?.quantity ?? 0;
                const threshold = product.stock?.lowStockThreshold ?? 10;
                const isLow = qty <= threshold && qty > 0;
                const isOut = qty === 0;
                const discount = product.pricing?.mrp && product.pricing.mrp > product.pricing.sellingPrice
                  ? Math.round(((product.pricing.mrp - product.pricing.sellingPrice) / product.pricing.mrp) * 100) : 0;

                return (
                  <motion.tr key={product._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                          style={{ background: `linear-gradient(135deg, ${product.color || '#D4AF37'}20, ${product.color || '#D4AF37'}50)` }}>
                          {product.images?.[0]
                            ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" onError={e => e.target.src = '/logo.png'} />
                            : <span className="text-xl">🧴</span>}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{product.name}</p>
                          <p className="text-xs text-white/40">{product.tags?.join(', ') || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white">₹{(product.pricing?.sellingPrice || 0).toLocaleString('en-IN')}</p>
                        {discount > 0 && <span className="text-[10px] bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded-full">{discount}% OFF</span>}
                      </div>
                      {product.pricing?.mrp > product.pricing?.sellingPrice && (
                        <p className="text-xs text-white/30 line-through">₹{(product.pricing.mrp).toLocaleString('en-IN')}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn('font-bold text-base', isOut ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-accent')}>{qty}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span className="text-accent text-base">★</span>
                        <span className="text-white font-medium">{product.rating ?? 5.0}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(product)} className="p-2 hover:bg-accent/10 rounded-lg transition-colors" title="Edit Product">
                          <Edit size={15} className="text-accent" />
                        </button>
                        <button onClick={() => handleDelete(product._id, product.name)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={15} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && <ProductModal product={modalProduct} onClose={closeModal} onSave={handleSaved} />}
      </AnimatePresence>
    </div>
  );
}
