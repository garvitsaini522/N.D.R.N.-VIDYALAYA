import React, { useState, useEffect } from 'react';
import {
  Image,
  Camera,
  ZoomIn,
  Layers,
  Sparkles,
  X,
  School,
  CheckCircle2,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { Card } from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import LoadingState from '../../components/common/LoadingState';
import Button from '../../components/common/Button';
import { SCHOOL_CONFIG } from '../../config/schoolConfig';
import { api } from '../../services/api';

const CATEGORY_COLORS = {
  Classroom: 'from-saffron-500 to-brown-800',
  Campus: 'from-gold-500 to-brown-900',
  'Sports & Play': 'from-saffron-600 to-saffron-700',
  Sports: 'from-saffron-600 to-saffron-700',
  'Arts & Craft': 'from-gold-600 to-brown-800',
  Activities: 'from-saffron-500 to-gold-600',
  Celebrations: 'from-saffron-600 to-brown-900',
  Other: 'from-brown-800 to-brown-950',
};

export default function Gallery() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activePhoto, setActivePhoto] = useState(null);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await api.getGallery();
      setGalleryItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to load gallery items:', err);
      setError('Unable to load gallery photos at this moment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();

    const handleUpdate = () => {
      fetchGallery();
    };
    window.addEventListener('ndrn:gallery-updated', handleUpdate);

    return () => {
      window.removeEventListener('ndrn:gallery-updated', handleUpdate);
    };
  }, []);

  const categories = [
    'All',
    'Classroom',
    'Campus',
    'Sports & Play',
    'Arts & Craft',
    'Celebrations',
  ];

  const filtered = galleryItems.filter((item) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Sports & Play') {
      return item.category === 'Sports & Play' || item.category === 'Sports';
    }
    if (selectedCategory === 'Arts & Craft') {
      return item.category === 'Arts & Craft' || item.category === 'Activities';
    }
    return item.category === selectedCategory;
  });

  return (
    <PageContainer
      title="Campus Photo Gallery"
      subtitle={`Visual glimpses of campus life, classroom learning, and student activities at ${SCHOOL_CONFIG.name}, ${SCHOOL_CONFIG.location.displayLocation}.`}
      badge="VISUAL ARCHIVE"
      breadcrumbs={[{ label: 'Gallery' }]}
    >
      <div className="space-y-10">
        {/* Category Filters Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 bg-cream-100 p-2 rounded-2xl border border-cream-200 max-w-3xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-saffron-500 text-white shadow-soft-sm'
                  : 'bg-white text-brown-700 hover:bg-cream-200 border border-cream-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Content Area */}
        {loading ? (
          <LoadingState message="Loading photo gallery from school archive..." />
        ) : error ? (
          <EmptyState
            title="Unable to load gallery"
            description={error}
            actionText="Try Again"
            onAction={fetchGallery}
          />
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((item) => {
              const imgUrl = item.imageUrl || item.url;
              const colorGradient =
                item.color ||
                CATEGORY_COLORS[item.category] ||
                'from-saffron-600 to-brown-900';

              return (
                <Card
                  key={item.id || item._id}
                  className="group cursor-pointer flex flex-col justify-between overflow-hidden bg-white border border-cream-200 hover:shadow-soft-lg transition-all duration-300"
                  onClick={() => setActivePhoto(item)}
                >
                  {/* Photo or Art container */}
                  <div
                    className={`relative h-52 bg-gradient-to-tr ${colorGradient} overflow-hidden text-white flex flex-col justify-between`}
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={item.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}

                    {/* Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent p-4 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/40 backdrop-blur-xs border border-white/20">
                          {item.category}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomIn className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      {/* Watermark identifier if no image loaded */}
                      {!imgUrl && (
                        <div className="absolute right-3 bottom-12 text-white/10 font-black text-6xl select-none pointer-events-none">
                          NDRN
                        </div>
                      )}

                      <div>
                        {!imgUrl && (
                          <span className="text-[10px] text-white/80 block uppercase font-bold tracking-wider">
                            [ Photo Archive ]
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-white drop-shadow-xs line-clamp-2 mt-0.5">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white">
                    <p className="text-xs text-brown-600 line-clamp-2 leading-relaxed">
                      {item.description || item.caption || 'Campus photograph from N.D.R.N. Vidyalaya.'}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title={galleryItems.length === 0 ? "No photographs available yet." : "No photos in this category"}
            description={galleryItems.length === 0 ? "Photographs of campus events and student activities will appear here when published." : "Please choose another category to view photo archives."}
            actionText={galleryItems.length === 0 ? undefined : "View All Photos"}
            onAction={() => setSelectedCategory('All')}
          />
        )}

        {/* Note regarding administrative review */}
        <div className="p-5 rounded-2xl bg-cream-100 border border-cream-200 text-center max-w-xl mx-auto text-xs text-brown-600">
          <Camera className="w-4 h-4 mx-auto mb-1 text-saffron-600" />
          <span>
            Note: High-resolution photographs of campus events, classrooms, and student activities are maintained and managed through the School Administrative Console.
          </span>
        </div>

        {/* Lightbox Modal */}
        {activePhoto && (
          <div
            className="fixed inset-0 z-50 bg-brown-950/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setActivePhoto(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl relative animate-scale-up border border-cream-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Media banner */}
              <div
                className={`relative min-h-[260px] max-h-[380px] bg-gradient-to-tr ${
                  activePhoto.color ||
                  CATEGORY_COLORS[activePhoto.category] ||
                  'from-saffron-600 to-brown-900'
                } flex flex-col justify-between overflow-hidden text-white`}
              >
                {activePhoto.imageUrl || activePhoto.url ? (
                  <img
                    src={activePhoto.imageUrl || activePhoto.url}
                    alt={activePhoto.title}
                    className="w-full h-full object-cover max-h-[380px]"
                  />
                ) : null}

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/30 p-6 flex flex-col justify-between">
                  <button
                    type="button"
                    onClick={() => setActivePhoto(null)}
                    className="self-end p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black/40 backdrop-blur-xs border border-white/20">
                      {activePhoto.category}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold mt-2 text-white">
                      {activePhoto.title}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs sm:text-sm text-brown-800 leading-relaxed">
                  {activePhoto.description ||
                    activePhoto.caption ||
                    'Student activity and campus life at N.D.R.N. Vidyalaya.'}
                </p>
                <div className="pt-3 border-t border-cream-200 flex items-center justify-between text-xs text-brown-600">
                  <span className="font-semibold">{SCHOOL_CONFIG.name}</span>
                  <span>{SCHOOL_CONFIG.location.displayLocation}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
