import React, { useEffect } from 'react';

const AdBanner = ({ slotId, style }) => {
  useEffect(() => {
    try {
      // AdSense 초기화
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense 에러:', err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export default AdBanner;