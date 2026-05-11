import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

interface SEOProps {
  streamTitle?: string;
  hostName?: string;
}

const AlgorithmBait: React.FC<SEOProps> = ({ streamTitle, hostName }) => {
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    axios.get("/api/growth/seo-meta").then(res => {
      setMeta(res.data);
    });
  }, []);

  const dynamicTitle = hostName ? `${hostName} Live | Oracle Elite` : meta?.title || "Oracle Live";
  const dynamicDesc = streamTitle ? `Watch ${hostName} in a high-stakes PK battle on Oracle.` : meta?.description;

  return (
    <Helmet>
      <title>{dynamicTitle}</title>
      <meta name="description" content={dynamicDesc} />
      <meta name="keywords" content={meta?.keywords} />
      
      {/* Open Graph - The Bot Bait */}
      <meta property="og:title" content={dynamicTitle} />
      <meta property="og:description" content={dynamicDesc} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Oracle Live Network" />
      
      {/* Search Engine Territory Tagging */}
      <meta name="geo.region" content="SA, AE, US, GB" />
      <meta name="target" content="all" />
      
      {/* JSON-LD Structured Data for Google */}
      {meta?.structured_data && (
        <script type="application/ld+json">
          {JSON.stringify(meta.structured_data)}
        </script>
      )}
    </Helmet>
  );
};

export default AlgorithmBait;
