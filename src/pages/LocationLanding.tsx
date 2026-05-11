
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapPin, Sparkles, Flame, Globe, Zap, Users, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { REGIONS } from "../constants/locationData";
import SuggestedStreams from "../components/SuggestedStreams";
import LiveCard from "../components/LiveCard";
import axios from "axios";

const LocationLanding: React.FC = () => {
  const { service, regionSlug, citySlug } = useParams<{ service: string; regionSlug: string; citySlug: string }>();
  const [loading, setLoading] = useState(true);
  const [streams, setStreams] = useState<any[]>([]);

  const region = REGIONS.find(r => r.slug === regionSlug);
  const city = region?.cities.find(c => c.slug === citySlug);

  const serviceName = service === "pk" ? "PK Battles" : "Live Streaming";
  const locationName = city ? `${city.name}, ${region?.name}` : region?.name || "Global";

  useEffect(() => {
    // Scroll to top on navigation
    window.scrollTo(0, 0);
    
    // Fetch generic feed for now, but in a real app, we'd filter by location if possible
    axios.get("/api/rec/feed")
      .then(res => {
        if (Array.isArray(res.data)) {
          setStreams(res.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [citySlug, regionSlug, service]);

  if (!region) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black italic uppercase italic tracking-tighter mb-4">Location Not Found</h1>
        <p className="text-white/50 mb-8">We haven't launched in this specific region yet.</p>
        <Link to="/" className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest hover:scale-105 transition-transform">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <Helmet>
        <title>{`${serviceName} in ${locationName} | Oracle Live Network`}</title>
        <meta name="description" content={`Experience high-stakes ${serviceName} and elite gifting in ${locationName}. Join the Oracle network to watch the top streamers from ${city?.name || region.name} live now.`} />
        <meta name="keywords" content={`${serviceName}, ${city?.name}, ${region.name}, live streaming, PK battles, gifting, influencers`} />
      </Helmet>

      {/* Hero Section - Location Specific */}
      <section className="relative h-[40vh] min-h-[400px] flex items-end px-6 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={`https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1920`} 
            className="w-full h-full object-cover opacity-40 grayscale"
            alt={locationName}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>

        <div className="relative z-10 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4"
          >
            <MapPin size={12} strokeWidth={3} />
            {region.name} • {city?.name || "Premium Hub"}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6 leading-[0.9]"
          >
            {serviceName} <br />
            <span className="text-transparent border-text-white">{city?.name || region.name}</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-3">
              <Users size={16} className="text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">{Math.floor(Math.random() * 500) + 100} Live Streamers</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-3">
              <Zap size={16} className="text-yellow-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">High Stakes Active</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Local Content Section */}
      <section className="px-6 py-12">
        <div className="flex items-end justify-between mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] italic">
              <Sparkles size={12} /> Local Spotlight
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Current in {city?.name || region.name}</h2>
          </div>
          <Link to="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors">
            View Global Feed
          </Link>
        </div>

        {/* Dynamic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="aspect-[9/16] bg-white/5 rounded-[2rem] animate-pulse border border-white/5" />
            ))
          ) : (
            streams.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <LiveCard 
                  id={video.id}
                  user={video.user}
                  thumbnail={`https://picsum.photos/seed/${video.id}/400/711`}
                  viewerCount={video.viewers || Math.floor(Math.random() * 5000)}
                />
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* SEO Content Block (Unique Local Data as per strategy) */}
      <section className="px-6 py-20 bg-white/5 border-y border-white/5 mx-6 rounded-[3rem]">
        <div className="max-w-3xl mx-auto space-y-12 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
                <Globe className="text-cyan-400" size={32} />
            </div>
            <h3 className="text-4xl font-black italic uppercase tracking-tighter italic">Why Oracle Live in {locationName}?</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="space-y-3">
              <h4 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2">
                <Trophy size={18} className="text-yellow-400" /> Professional PK Battles
              </h4>
              <p className="text-sm text-white/60 leading-relaxed">
                Streamers in {city?.name || region.name} are redefining entertainment with high-stakes PK battles. Join our local community to support your favorite creators and witness the most intense gifting wars in the {region.name} region.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2">
                <Sparkles size={18} className="text-cyan-400" /> Elite Gifting Network
              </h4>
              <p className="text-sm text-white/60 leading-relaxed">
                Oracle Live connects the elite of {city?.name || region.name}. Our platform is specialized for high-value interactions, ensuring that big players from across {region.name} can engage with top-tier talent in a secure, luxury environment.
              </p>
            </div>
          </div>

          <div className="pt-8">
            <Link to="/auth" className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-[2rem] font-black uppercase italic tracking-widest hover:scale-105 transition-transform group">
              Join the Network
              <Zap size={18} className="group-hover:fill-black" />
            </Link>
          </div>
        </div>
      </section>

      {/* Internal Linking for SEO (Pyramid Structure) */}
      <section className="px-6 py-20">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-8 text-center">Explore Other Hubs in {region.name}</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {region.cities.filter(c => c.slug !== citySlug).slice(0, 15).map(neighbor => (
            <Link 
              key={neighbor.slug}
              to={`/${service}/${region.slug}/${neighbor.slug}`}
              className="px-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              {neighbor.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LocationLanding;
