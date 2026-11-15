
// Device detection is not based on width: narrow desktop windows remain supported.
(()=>{const ua=navigator.userAgent||'';const mobileUA=/(Android|iPhone|iPad|iPod|Windows Phone|Silk|Kindle)/i.test(ua);const ipad=navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1;const tablet=navigator.maxTouchPoints>0&&matchMedia('(pointer: coarse)').matches;window.__WEBRRARIA_MOBILE_BLOCKED__=!!(navigator.userAgentData?.mobile||mobileUA||ipad||tablet);if(window.__WEBRRARIA_MOBILE_BLOCKED__)document.documentElement.classList.add('mobile-unsupported');})();
