import { useState, useEffect, useRef, createContext, useContext } from 'react';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  parchment: '#F5EFE0', parchmentDark: '#EDE3CA', ink: '#2C1F0E',
  inkLight: '#5C4A2A', gold: '#B8860B', goldLight: '#D4A942',
  goldPale: '#F0D98A', cream: '#FBF6EC', burgundy: '#6B1F2A',
  forest: '#2A4A35', sienna: '#8B4513', warmGray: '#9A8F7E', border: '#D4C9A8',
};
const F = { serif: "'EB Garamond','Georgia',serif", sans: "'Lato','system-ui',sans-serif", display: "'Cormorant Garamond','Georgia',serif" };

const GS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Lato:wght@300;400;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;overflow-x:hidden}
  body{background:${C.parchment};font-family:${F.sans};color:${C.ink};overscroll-behavior:none;-webkit-tap-highlight-color:transparent;-webkit-font-smoothing:antialiased}
  button{-webkit-tap-highlight-color:transparent;touch-action:manipulation}
  input,textarea{-webkit-appearance:none;border-radius:0}
  textarea{font-family:${F.serif}}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:${C.parchmentDark}}
  ::-webkit-scrollbar-thumb{background:${C.warmGray};border-radius:2px}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
  @keyframes audioBar{0%,100%{height:5px}50%{height:18px}}
  @keyframes splashFade{0%{opacity:1;transform:scale(1)}85%{opacity:1;transform:scale(1.03)}100%{opacity:0;transform:scale(1.05)}}
  @keyframes splashIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  .fade-in{animation:fadeIn .4s ease forwards}
  .slide-up{animation:slideUp .35s ease forwards}
  @keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
  @keyframes milestoneIn{0%{transform:scale(0.5);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
  @keyframes verseSwap{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}
  @keyframes shimmerPull{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}
  .verse-swap{animation:verseSwap 0.5s ease forwards}
`;

// ─── SAFE STORAGE ─────────────────────────────────────────────────────────────
function lsGet(k: string, fb: string = ''): string { try { return localStorage.getItem(k) ?? fb; } catch { return fb; } }
function lsSet(k: string, v: string): void { try { localStorage.setItem(k, v); } catch {} }
function lsGetJ<T>(k: string, fb: T): T { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } }
function lsSetJ(k: string, v: unknown): void { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
const ls = { get: lsGet, set: lsSet, getJ: lsGetJ, setJ: lsSetJ };

// ─── 30 DEVOTIONALS (rotates by day-of-year) ─────────────────────────────────
const DEVOTIONALS = [
  { verse: 'The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.', ref: 'Lamentations 3:22-23', title: 'New Every Morning', theme: 'Mercy', reflection: "Where in your life do you need to receive God's mercy afresh today? What would it look like to start this morning as a blank canvas before Him?" },
  { verse: 'Be still, and know that I am God. I will be exalted among the nations, I will be exalted in the earth!', ref: 'Psalm 46:10', title: 'Sacred Stillness', theme: 'Peace', reflection: 'In a world of constant noise, how might you create a moment of genuine stillness today? What anxieties do you need to lay down before Him?' },
  { verse: 'For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.', ref: 'Jeremiah 29:11', title: 'A Hope and a Future', theme: 'Hope', reflection: "Are there areas where you struggle to trust God's plans over your own? How might surrendering control open you to something greater?" },
  { verse: 'I can do all things through him who strengthens me.', ref: 'Philippians 4:13', title: 'Strength in Him', theme: 'Strength', reflection: 'What challenge are you facing this week where you are tempted to rely on your own strength? How might leaning on Christ change your approach?' },
  { verse: 'Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.', ref: 'Proverbs 3:5-6', title: 'Paths Made Straight', theme: 'Trust', reflection: "In which decisions today are you tempted to lean on your own understanding rather than seeking God's wisdom first?" },
  { verse: 'Come to me, all who labor and are heavy laden, and I will give you rest.', ref: 'Matthew 11:28', title: 'Rest for the Weary', theme: 'Rest', reflection: 'What burdens are you carrying that Jesus is inviting you to lay at His feet today? What would it feel like to truly rest in Him?' },
  { verse: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.', ref: 'Romans 8:28', title: 'All Things Together', theme: 'Providence', reflection: 'Is there something in your life that feels broken or without purpose right now? How does this promise shape the way you see that situation?' },
  { verse: 'The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters.', ref: 'Psalm 23:1-2', title: 'The Good Shepherd', theme: 'Provision', reflection: 'In what area of your life do you most need to trust that your Shepherd is leading you, even when the path is unclear?' },
  { verse: 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God.', ref: 'Ephesians 2:8', title: 'Gift of Grace', theme: 'Grace', reflection: 'Do you find it easier to receive grace for others than for yourself? What would it mean to fully accept that your salvation is a gift, not an achievement?' },
  { verse: 'Create in me a clean heart, O God, and renew a right spirit within me.', ref: 'Psalm 51:10', title: 'A Clean Heart', theme: 'Renewal', reflection: 'What needs to be surrendered to God today so that renewal can begin? Is there an area of your heart you have been reluctant to hand over to Him?' },
  { verse: 'The heart of man plans his way, but the Lord establishes his steps.', ref: 'Proverbs 16:9', title: 'Established Steps', theme: 'Guidance', reflection: 'Where in your life are you gripping your own plans tightly? How might releasing them to God actually lead to something better?' },
  { verse: 'Rejoice always, pray without ceasing, give thanks in all circumstances; for this is the will of God in Christ Jesus for you.', ref: '1 Thessalonians 5:16-18', title: 'Always Rejoicing', theme: 'Gratitude', reflection: 'What is one thing you can genuinely give thanks for today, even if your circumstances feel difficult?' },
  { verse: 'But those who wait for the Lord shall renew their strength; they shall mount up with wings like eagles.', ref: 'Isaiah 40:31', title: 'Wings Like Eagles', theme: 'Waiting', reflection: 'Is there a season of waiting you are in right now? How might this verse reframe waiting as something sacred rather than frustrating?' },
  { verse: 'A soft answer turns away wrath, but a harsh word stirs up anger.', ref: 'Proverbs 15:1', title: 'The Gentle Word', theme: 'Wisdom', reflection: 'Think of a relationship where tension exists. How might choosing gentleness today change the dynamic in a way that force never could?' },
  { verse: 'For God gave us a spirit not of fear but of power and love and self-control.', ref: '2 Timothy 1:7', title: 'Not of Fear', theme: 'Courage', reflection: 'What fear is holding you back from something God may be calling you toward? How does this verse speak directly to that fear?' },
  { verse: 'Blessed are the pure in heart, for they shall see God.', ref: 'Matthew 5:8', title: 'Pure in Heart', theme: 'Holiness', reflection: 'Purity of heart is about undivided devotion. Where is your heart divided between God and something else today?' },
  { verse: 'Your word is a lamp to my feet and a light to my path.', ref: 'Psalm 119:105', title: 'Lamp to My Feet', theme: 'Scripture', reflection: 'How regularly are you turning to God\'s Word for direction? What would daily Scripture look like as a living practice?' },
  { verse: 'Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come.', ref: '2 Corinthians 5:17', title: 'New Creation', theme: 'Identity', reflection: 'Are you living from your old identity or your new one? Which old labels do you need to consciously lay down today?' },
  { verse: 'The Lord is near to the brokenhearted and saves the crushed in spirit.', ref: 'Psalm 34:18', title: 'Near to the Broken', theme: 'Comfort', reflection: 'Where is your heart broken today? Do you believe God is close to you in that pain, or does He feel distant? Talk to Him honestly.' },
  { verse: 'Do nothing from selfish ambition or conceit, but in humility count others more significant than yourselves.', ref: 'Philippians 2:3', title: 'The Way of Humility', theme: 'Humility', reflection: 'In your relationships today, where might you choose to place another\'s needs above your own comfort or preferences?' },
  { verse: 'And whatever you do, in word or deed, do everything in the name of the Lord Jesus, giving thanks to God the Father through him.', ref: 'Colossians 3:17', title: 'Everything as Worship', theme: 'Work', reflection: 'How would your ordinary tasks today change if you approached each one as an act of worship? What would you do differently?' },
  { verse: 'He has told you, O man, what is good; and what does the Lord require of you but to do justice, and to love kindness, and to walk humbly with your God.', ref: 'Micah 6:8', title: 'What He Requires', theme: 'Justice', reflection: 'Of the three calls — justice, kindness, humility — which one feels most challenging for you in this season? Why?' },
  { verse: 'Cast your burden on the Lord, and he will sustain you; he will never permit the righteous to be moved.', ref: 'Psalm 55:22', title: 'Cast Your Burden', theme: 'Surrender', reflection: 'What weight have you been carrying alone that God is explicitly inviting you to throw onto Him today? What is stopping you from letting it go?' },
  { verse: 'Love is patient and kind; love does not envy or boast; it is not arrogant or rude.', ref: '1 Corinthians 13:4-5', title: 'The Shape of Love', theme: 'Love', reflection: 'Of these qualities — patience, kindness, humility — which one is God specifically asking you to grow in within your closest relationships?' },
  { verse: 'I have been crucified with Christ. It is no longer I who live, but Christ who lives in me.', ref: 'Galatians 2:20', title: 'No Longer I', theme: 'Surrender', reflection: 'What does it mean practically for Christ to live through you today? What would change if He were truly in the driver\'s seat of your decisions?' },
  { verse: 'Delight yourself in the Lord, and he will give you the desires of your heart.', ref: 'Psalm 37:4', title: 'Delight in Him', theme: 'Desire', reflection: 'What are you most deeply desiring right now? Have you brought that desire before God honestly, or kept it at arm\'s length from Him?' },
  { verse: 'Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.', ref: 'Philippians 4:6', title: 'Pray, Not Worry', theme: 'Anxiety', reflection: 'What specific worry can you convert into a specific prayer right now? Write it out and hand it over to God.' },
  { verse: 'Greater love has no one than this, that someone lay down his life for his friends.', ref: 'John 15:13', title: 'Greatest Love', theme: 'Sacrifice', reflection: 'Laying down our lives often means laying down our time, comfort, or preferences. Who is God asking you to love sacrificially this week?' },
  { verse: 'For the Lord your God is with you wherever you go.', ref: 'Joshua 1:9', title: 'Wherever You Go', theme: 'Presence', reflection: 'Is there a hard conversation, scary transition, or uncertain future you are walking into? Hear this promise spoken personally to you.' },
  { verse: 'Now faith is the assurance of things hoped for, the conviction of things not seen.', ref: 'Hebrews 11:1', title: 'Unseen Realities', theme: 'Faith', reflection: 'What are you believing God for that you cannot yet see? How does this definition of faith reshape what it means to trust Him?' },
];

const getDevoForToday = () => {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000);
  return DEVOTIONALS[dayOfYear % DEVOTIONALS.length];
};
const todayDevo = getDevoForToday();



// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE 1: ONBOARDING SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
const ONBOARDING_SLIDES = [
  {
    icon: '✝',
    title: 'Daily Bread',
    subtitle: 'A fresh verse and reflection every morning to nourish your soul.',
    color: '#6B1F2A',
  },
  {
    icon: '💬',
    title: 'Ask Logos',
    subtitle: 'Your gentle AI Bible companion. Ask about Scripture, theology, or share what\'s on your heart.',
    color: '#2A4A35',
  },
  {
    icon: '🙏',
    title: 'Pray Together',
    subtitle: 'Journal your prayers, track your reading, and lift up your community on the Prayer Wall.',
    color: '#8B4513',
  },
];

function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [slide, setSlide] = useState(0);
  const [exiting, setExiting] = useState(false);

  function finish() {
    setExiting(true);
    lsSet('manna_onboarded', 'true');
    setTimeout(onDone, 400);
  }

  function next() {
    if (slide < ONBOARDING_SLIDES.length - 1) setSlide(s => s + 1);
    else finish();
  }

  const s = ONBOARDING_SLIDES[slide];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'linear-gradient(160deg,' + s.color + ' 0%,#1A0A04 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 32px',
      transition: 'background 0.6s ease',
      opacity: exiting ? 0 : 1,
      transform: exiting ? 'scale(1.04)' : 'scale(1)',
      transitionProperty: 'opacity,transform,background',
      transitionDuration: '0.4s',
    }}>
      {/* Skip */}
      <button onClick={finish} style={{ position: 'absolute', top: 56, right: 24, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontFamily: F.sans, fontSize: 13, cursor: 'pointer', letterSpacing: 1 }}>
        Skip
      </button>

      {/* Icon */}
      <div style={{ width: 100, height: 100, borderRadius: 28, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(240,217,138,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, marginBottom: 40, animation: 'splashIn 0.5s ease both' }}>
        {s.icon}
      </div>

      {/* Text */}
      <div style={{ textAlign: 'center', maxWidth: 340, marginBottom: 48, animation: 'splashIn 0.5s ease 0.1s both' }}>
        <h1 style={{ fontFamily: F.display, fontSize: 42, fontWeight: 300, color: '#F0D98A', marginBottom: 16, lineHeight: 1.1 }}>{s.title}</h1>
        <p style={{ fontFamily: F.serif, fontSize: 17, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, fontStyle: 'italic' }}>{s.subtitle}</p>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
        {ONBOARDING_SLIDES.map((_, i) => (
          <div key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 24 : 8, height: 8, borderRadius: 4, background: i === slide ? '#D4A942' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s', cursor: 'pointer' }} />
        ))}
      </div>

      {/* Button */}
      <button onClick={next} style={{ width: '100%', maxWidth: 320, padding: '16px', borderRadius: 16, background: 'linear-gradient(135deg,#B8860B,#8B4513)', border: 'none', color: '#2C1F0E', fontFamily: F.sans, fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: 1 }}>
        {slide === ONBOARDING_SLIDES.length - 1 ? '✝ Begin My Journey' : 'Continue →'}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE 5: STREAK MILESTONE MODAL
// ═══════════════════════════════════════════════════════════════════════════════
const MILESTONE_VERSES: Record<number, {verse: string; ref: string}> = {
  3:  { verse: 'This is the day that the Lord has made; let us rejoice and be glad in it.', ref: 'Psalm 118:24' },
  7:  { verse: 'Blessed is the man who walks not in the counsel of the wicked... his delight is in the law of the Lord.', ref: 'Psalm 1:1-2' },
  14: { verse: 'I have stored up your word in my heart, that I might not sin against you.', ref: 'Psalm 119:11' },
  30: { verse: 'But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles.', ref: 'Isaiah 40:31' },
};
const MILESTONE_DAYS = [3, 7, 14, 30];

function ConfettiPiece({ color, left, delay, size }: { color: string; left: number; delay: number; size: number }) {
  return (
    <div style={{
      position: 'absolute', top: -20, left: left + '%',
      width: size, height: size * 0.4,
      background: color, borderRadius: 2,
      animation: `confettiFall ${1.5 + Math.random()}s ease ${delay}s both`,
      zIndex: 9999,
    }} />
  );
}

function MilestonModal({ streak, onClose }: { streak: number; onClose: () => void }) {
  const mv = MILESTONE_VERSES[streak];
  const confettiColors = ['#D4A942','#B8860B','#F0D98A','#8B3A4A','#3A6B4A','#fff'];
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    color: confettiColors[i % confettiColors.length],
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    size: 6 + Math.random() * 8,
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9997, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'hidden' }} onClick={onClose}>
      {pieces.map((p, i) => <ConfettiPiece key={i} {...p} />)}
      <div style={{ background: 'linear-gradient(160deg,#3A1A08,#1A0A04)', borderRadius: 24, padding: '36px 28px', maxWidth: 360, width: '100%', border: '1px solid #B8860B', textAlign: 'center', animation: 'milestoneIn 0.5s ease both', position: 'relative', zIndex: 10 }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🔥</div>
        <div style={{ fontFamily: F.display, fontSize: 52, color: '#D4A942', fontWeight: 300, lineHeight: 1, marginBottom: 4 }}>{streak}</div>
        <div style={{ fontFamily: F.sans, fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#B8860B', marginBottom: 24 }}>Day Streak</div>
        {mv && (
          <div style={{ background: 'rgba(184,134,11,0.1)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, borderLeft: '3px solid #B8860B' }}>
            <p style={{ fontFamily: F.serif, fontSize: 15, fontStyle: 'italic', color: '#F0E6D3', lineHeight: 1.7, marginBottom: 8 }}>"{mv.verse}"</p>
            <p style={{ fontFamily: F.sans, fontSize: 11, color: '#B8860B', letterSpacing: 1.5, textTransform: 'uppercase' }}>— {mv.ref}</p>
          </div>
        )}
        <p style={{ fontFamily: F.serif, fontSize: 14, color: 'rgba(240,217,138,0.6)', marginBottom: 24, fontStyle: 'italic' }}>
          {streak === 3 ? 'Three days faithful. Keep going.' : streak === 7 ? 'A full week in the Word. You\'re building something real.' : streak === 14 ? 'Two weeks strong. God sees your faithfulness.' : 'Thirty days. This is no longer a habit — it\'s a lifestyle.'}
        </p>
        <button onClick={onClose} style={{ width: '100%', padding: 14, borderRadius: 12, background: 'linear-gradient(135deg,#B8860B,#8B4513)', border: 'none', color: '#2C1F0E', fontFamily: F.sans, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Continue in Faith ✝
        </button>
      </div>
    </div>
  );
}


// ─── SPLASH SCREEN ────────────────────────────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(160deg,#2C1F0E 0%,#1A0A04 60%,#2C1208 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'splashFade 0.55s ease-in 1.65s forwards',
    }}>
      {/* Texture overlay */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(255,255,255,.5) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(255,255,255,.5) 60px)' }} />
      {/* Outer glow ring */}
      <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(184,134,11,0.15) 0%,transparent 70%)' }} />
      {/* Cross icon */}
      <div style={{ animation: 'splashIn 0.7s ease 0.1s both', marginBottom: 28, position: 'relative' }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(184,134,11,0.12)', border: '1px solid rgba(184,134,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D4A942" strokeWidth="1.8" strokeLinecap="round">
            <line x1="12" y1="2" x2="12" y2="22"/>
            <line x1="2" y1="8" x2="22" y2="8"/>
          </svg>
        </div>
        {/* Corner accents */}
        <div style={{ position: 'absolute', top: -8, left: -8, width: 16, height: 16, borderTop: '2px solid rgba(184,134,11,0.5)', borderLeft: '2px solid rgba(184,134,11,0.5)', borderRadius: '2px 0 0 0' }} />
        <div style={{ position: 'absolute', top: -8, right: -8, width: 16, height: 16, borderTop: '2px solid rgba(184,134,11,0.5)', borderRight: '2px solid rgba(184,134,11,0.5)', borderRadius: '0 2px 0 0' }} />
        <div style={{ position: 'absolute', bottom: -8, left: -8, width: 16, height: 16, borderBottom: '2px solid rgba(184,134,11,0.5)', borderLeft: '2px solid rgba(184,134,11,0.5)', borderRadius: '0 0 0 2px' }} />
        <div style={{ position: 'absolute', bottom: -8, right: -8, width: 16, height: 16, borderBottom: '2px solid rgba(184,134,11,0.5)', borderRight: '2px solid rgba(184,134,11,0.5)', borderRadius: '0 0 2px 0' }} />
      </div>
      {/* App name */}
      <div style={{ animation: 'splashIn 0.7s ease 0.3s both', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'EB Garamond','Georgia',serif", fontSize: 48, fontWeight: 500, color: '#F0D98A', letterSpacing: 2, marginBottom: 10 }}>Manna</h1>
        <div style={{ width: 40, height: 1, background: 'rgba(184,134,11,0.5)', margin: '0 auto 14px' }} />
        <p style={{ fontFamily: "'Lato','system-ui',sans-serif", fontSize: 13, color: 'rgba(184,134,11,0.65)', letterSpacing: 4, textTransform: 'uppercase', fontWeight: 300 }}>Daily Bread for the Soul</p>
      </div>
      {/* Loading dots */}
      <div style={{ animation: 'splashIn 0.7s ease 0.7s both', display: 'flex', gap: 8, marginTop: 48 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(184,134,11,0.5)', animation: 'pulse 1.4s ease infinite', animationDelay: i * 0.2 + 's' }} />
        ))}
      </div>
    </div>
  );
}

// ─── DARK MODE ────────────────────────────────────────────────────────────────
const DARK = {
  parchment: '#1A0F06', parchmentDark: '#231508', ink: '#F0E6D3',
  inkLight: '#C9B99A', gold: '#D4A942', goldLight: '#E8C060',
  goldPale: '#F0D98A', cream: '#241810', burgundy: '#8B3A4A',
  forest: '#3A6B4A', sienna: '#A0522D', warmGray: '#7A6A5A', border: '#3D2E1E',
};

const ThemeCtx = createContext({ dark: false, toggle: () => {} });
function useTheme() { return useContext(ThemeCtx); }


// ─── WEEKLY ARC THEMES ────────────────────────────────────────────────────────
const WEEKLY_THEMES = [
  { theme: 'Stillness',    ref: 'Psalm 46:10',           desc: 'Learning to be quiet before God in a noisy world.' },
  { theme: 'Gratitude',   ref: '1 Thessalonians 5:18',   desc: 'Training your eyes to see gifts in every season.' },
  { theme: 'Surrender',   ref: 'Proverbs 3:5-6',         desc: "Releasing control and trusting God's path." },
  { theme: 'Hope',        ref: 'Romans 15:13',            desc: 'Anchoring your soul to what is unseen but certain.' },
  { theme: 'Faithfulness',ref: 'Lamentations 3:23',      desc: 'Showing up for God daily, even in small ways.' },
  { theme: 'Mercy',       ref: 'Micah 6:8',              desc: "Receiving and extending the grace you've been given." },
  { theme: 'Renewal',     ref: '2 Corinthians 5:17',     desc: 'Letting God make something new from where you are.' },
  { theme: 'Courage',     ref: 'Joshua 1:9',             desc: 'Stepping forward in faith when fear says otherwise.' },
];
const getWeeklyTheme = () => {
  const weekNum = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 86400000));
  return WEEKLY_THEMES[weekNum % WEEKLY_THEMES.length];
};

// ─── EMOTIONAL CHECK-IN ───────────────────────────────────────────────────────
const CHECK_IN_MOODS = [
  { emoji: '🕊️', label: 'Peaceful',  prefix: 'From a place of stillness, receive this:' },
  { emoji: '😔', label: 'Heavy',     prefix: 'In your heaviness, hear this tender word:' },
  { emoji: '🙏', label: 'Grateful',  prefix: 'From a heart of gratitude, receive this:' },
  { emoji: '😰', label: 'Anxious',   prefix: 'In your anxiety, be held by this:' },
  { emoji: '🌿', label: 'Hopeful',   prefix: 'In your expectation, be nourished by this:' },
];

// ─── READING PLAN ─────────────────────────────────────────────────────────────
const READING_PLAN = [
  { day: 1, book: 'Genesis', chapter: '1-2', theme: 'Creation' },
  { day: 2, book: 'Genesis', chapter: '3-5', theme: 'The Fall' },
  { day: 3, book: 'Genesis', chapter: '6-9', theme: 'The Flood' },
  { day: 4, book: 'Psalm', chapter: '1-8', theme: 'Praise' },
  { day: 5, book: 'Psalm', chapter: '9-17', theme: 'Lament' },
  { day: 6, book: 'Genesis', chapter: '10-15', theme: 'Nations' },
  { day: 7, book: 'Matthew', chapter: '1-4', theme: 'Jesus Begins' },
  { day: 8, book: 'Matthew', chapter: '5-7', theme: 'Sermon on the Mount' },
  { day: 9, book: 'Psalm', chapter: '18-22', theme: 'Messianic' },
  { day: 10, book: 'Genesis', chapter: '16-20', theme: "Abraham's Faith" },
  { day: 11, book: 'Matthew', chapter: '8-10', theme: 'Miracles' },
  { day: 12, book: 'Psalm', chapter: '23-30', theme: 'Trust' },
  { day: 13, book: 'Genesis', chapter: '21-25', theme: 'Isaac' },
  { day: 14, book: 'Matthew', chapter: '11-13', theme: 'Parables' },
];

const SUGGESTED_QUESTIONS = [
  "Help me sit with today's verse",
  "I'm struggling with doubt — speak to that",
  'Guide me into silent reflection',
  'What does the Church say about suffering?',
  'Pray with me right now',
];

const JOURNAL_PROMPTS = [
  'Lord, today I am grateful for...',
  'Father, I am struggling with...',
  'What I sense You saying to me today is...',
  'A person I want to lift up in prayer today...',
  'Help me surrender this to You, Lord...',
];

const COMMUNITY_PRAYERS_DEFAULT = [
  { id: 1, author: 'Sofia M.', text: "Pray for my mother's healing — she begins treatment next week. Trust that God is her physician.", time: '2 hours ago', hearts: 24, category: 'Healing' },
  { id: 2, author: 'James T.', text: 'Grateful for provision this month — God supplied beyond what I expected. Praise Him!', time: '5 hours ago', hearts: 41, category: 'Praise' },
  { id: 3, author: 'Anika R.', text: 'Seeking wisdom as I navigate a difficult decision at work. Praying for clarity and peace.', time: '1 day ago', hearts: 17, category: 'Wisdom' },
  { id: 4, author: 'David O.', text: 'Lifting up our community — may the love of Christ be evident in how we serve one another.', time: '2 days ago', hearts: 33, category: 'Community' },
];

const CATEGORIES = ['Prayer', 'Praise', 'Healing', 'Wisdom', 'Community'];
const catColors: Record<string, string> = { Prayer: C.burgundy, Praise: C.gold, Healing: C.forest, Wisdom: C.sienna, Community: '#4A6B8A' };


// ─── THEME HOOK ───────────────────────────────────────────────────────────────
function useC() {
  const { dark } = useTheme();
  return dark ? DARK : C;
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
function CrossIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="8" x2="22" y2="8"/></svg>;
}
function BookIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}
function PenIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
}
function HeartIcon({ size = 20, filled = false }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}
function UsersIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function SunIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
}
function SendIcon({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
}
function SpeakerIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;
}
function PlayIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
}
function PauseIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
}
function StopIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16"/></svg>;
}
function ShareIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>;
}
function DownloadIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function BellIcon({ size = 24 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function CopyIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><rect x='9' y='9' width='13' height='13' rx='2' ry='2'/><path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'/></svg>;
}
function MoonIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'/></svg>;
}
function SunSmallIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='5'/><line x1='12' y1='1' x2='12' y2='3'/><line x1='12' y1='21' x2='12' y2='23'/><line x1='4.22' y1='4.22' x2='5.64' y2='5.64'/><line x1='18.36' y1='18.36' x2='19.78' y2='19.78'/><line x1='1' y1='12' x2='3' y2='12'/><line x1='21' y1='12' x2='23' y2='12'/><line x1='4.22' y1='19.78' x2='5.64' y2='18.36'/><line x1='18.36' y1='5.64' x2='19.78' y2='4.22'/></svg>;
}
function ClockIcon({ size = 18 }) {
  return <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/></svg>;
}
function BookmarkIcon({ size = 18, filled = false }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
}
function XIcon({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}


function scheduleNotificationAt(hour: number) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, 0, 0, 0);
  if (now >= next) next.setDate(next.getDate() + 1);
  setTimeout(() => {
    new Notification('Manna - Daily Bread', {
      body: todayDevo.ref + ': "' + todayDevo.verse.slice(0, 80) + '..."',
      icon: '/favicon.svg',
    });
    scheduleNotificationAt(hour);
  }, next.getTime() - now.getTime());
}

// ─── NOTIFICATION HELPER ──────────────────────────────────────────────────────

// ─── CUSTOM NOTIFICATION TIME MODAL ──────────────────────────────────────────
function NotifTimeModal({ onClose }: { onClose: () => void }) {
  const c = useC();
  const [hour, setHour] = useState(() => parseInt(lsGet('manna_notif_hour', '7'), 10));
  const [ampm, setAmpm] = useState(() => lsGet('manna_notif_ampm', 'AM'));

  function save() {
    let h = hour;
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    lsSet('manna_notif_hour', String(hour));
    lsSet('manna_notif_ampm', ampm);
    lsSet('manna_notif', 'granted');
    scheduleNotificationAt(h);
    onClose();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: c.cream, borderRadius: 20, padding: 28, width: '100%', maxWidth: 340, border: '1px solid ' + c.border }} onClick={e => e.stopPropagation()} className="slide-up">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,' + c.burgundy + ',' + c.ink + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: c.goldPale }}>
            <ClockIcon size={22} />
          </div>
          <h3 style={{ fontFamily: F.serif, fontSize: 22, color: c.ink, marginBottom: 6 }}>Set Reminder Time</h3>
          <p style={{ fontFamily: F.serif, fontSize: 14, color: c.inkLight, fontStyle: 'italic' }}>Choose when God's Word greets you each day</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setHour(h => h === 12 ? 1 : h + 1)} style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', color: c.gold }}>▲</button>
            <div style={{ width: 72, height: 72, borderRadius: 16, background: c.parchmentDark, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid ' + c.gold }}>
              <span style={{ fontFamily: F.serif, fontSize: 32, color: c.ink, fontWeight: 500 }}>{String(hour).padStart(2, '0')}</span>
            </div>
            <button onClick={() => setHour(h => h === 1 ? 12 : h - 1)} style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', color: c.gold }}>▼</button>
          </div>
          <span style={{ fontFamily: F.serif, fontSize: 36, color: c.ink, fontWeight: 500, marginTop: -4 }}>:</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ height: 32 }} />
            <div style={{ width: 72, height: 72, borderRadius: 16, background: c.parchmentDark, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid ' + c.border }}>
              <span style={{ fontFamily: F.serif, fontSize: 32, color: c.inkLight }}>00</span>
            </div>
            <div style={{ height: 32 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['AM','PM'].map(p => (
              <button key={p} onClick={() => setAmpm(p)} style={{ width: 56, height: 32, borderRadius: 10, background: ampm === p ? c.gold : 'transparent', border: '1px solid ' + (ampm === p ? c.gold : c.border), fontFamily: F.sans, fontSize: 13, fontWeight: 700, color: ampm === p ? c.ink : c.inkLight, cursor: 'pointer' }}>{p}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 14, background: 'transparent', border: '1px solid ' + c.border, borderRadius: 12, fontFamily: F.sans, fontSize: 14, color: c.warmGray, cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} style={{ flex: 2, padding: 14, background: 'linear-gradient(135deg,' + c.gold + ',' + c.sienna + ')', border: 'none', borderRadius: 12, fontFamily: F.sans, fontSize: 14, fontWeight: 700, color: c.ink, cursor: 'pointer' }}>
            🔔 Save Reminder
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── NOTIFICATION PROMPT ──────────────────────────────────────────────────────
function NotifPrompt({ onDone }: { onDone: () => void }) {
  const c = useC();
  async function allow() {
    const perm = await Notification.requestPermission();
    lsSet('manna_notif', perm === 'granted' ? 'granted' : 'denied');
    if (perm === 'granted') scheduleNotificationAt(7);
    onDone();
  }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'flex-end', padding: 16 }}>
      <div className="slide-up" style={{ background: c.cream, borderRadius: 20, padding: 28, width: '100%', maxWidth: 398, margin: '0 auto', border: '1px solid ' + c.border }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,' + c.burgundy + ',' + c.ink + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: c.goldPale }}>
            <BellIcon size={24} />
          </div>
          <h3 style={{ fontFamily: F.serif, fontSize: 22, color: c.ink, marginBottom: 10 }}>Morning Devotional Reminders</h3>
          <p style={{ fontFamily: F.serif, fontSize: 15, color: c.inkLight, lineHeight: 1.7, fontStyle: 'italic' }}>
            Start each day with God's Word. We'll gently remind you at 7:00 AM with today's verse.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onDone} style={{ flex: 1, padding: 14, background: 'transparent', border: '1px solid ' + c.border, borderRadius: 12, fontFamily: F.sans, fontSize: 14, color: c.warmGray, cursor: 'pointer' }}>Not now</button>
          <button onClick={allow} style={{ flex: 2, padding: 14, background: 'linear-gradient(135deg,' + c.gold + ',' + c.sienna + ')', border: 'none', borderRadius: 12, fontFamily: F.sans, fontSize: 14, fontWeight: 700, color: c.ink, cursor: 'pointer' }}>
            🔔 Remind me at 7 AM
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AUDIO PLAYER BAR ─────────────────────────────────────────────────────────
function AudioPlayerBar({ text, onClose }: { text: string; onClose: () => void }) {
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(Date.now());
  const estimated = text.length * 65;

  useEffect(() => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85; u.pitch = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(v => v.lang === 'en-GB') || voices.find(v => v.lang.startsWith('en'));
    if (v) u.voice = v;
    u.onend = () => { setPlaying(false); setProgress(100); if (intervalRef.current) clearInterval(intervalRef.current); };
    window.speechSynthesis.speak(u);
    intervalRef.current = setInterval(() => {
      setProgress(Math.min(((Date.now() - startRef.current) / estimated) * 100, 98));
    }, 200);
    return () => { window.speechSynthesis.cancel(); if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  function togglePlay() {
    if (playing) { window.speechSynthesis.pause(); setPlaying(false); }
    else { window.speechSynthesis.resume(); setPlaying(true); }
  }

  return (
    <div className="slide-up" style={{ position: 'fixed', bottom: 68, left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 32px)', maxWidth: 398, background: C.ink, borderRadius: 16, padding: '14px 16px', border: `1px solid ${C.gold}`, zIndex: 90, boxShadow: '0 -4px 24px rgba(0,0,0,0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 24, width: 20, flexShrink: 0 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width: 3, background: C.gold, borderRadius: 2, minHeight: 5, animation: playing ? `audioBar 0.8s ease infinite` : 'none', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: F.serif, fontSize: 12, color: C.goldPale, marginBottom: 6, fontStyle: 'italic' }}>Reading aloud...</p>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
            <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg,${C.gold},${C.goldLight})`, borderRadius: 2, transition: 'width 0.2s' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={togglePlay} style={{ width: 36, height: 36, borderRadius: '50%', background: C.gold, border: 'none', color: C.ink, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button onClick={() => { window.speechSynthesis.cancel(); onClose(); }} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: C.warmGray, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <StopIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SHARE CARD MODAL ─────────────────────────────────────────────────────────
function ShareModal({ verse, verseRef, title, onClose }: { verse: string; verseRef: string; title: string; onClose: () => void }) {
  const [dataUrl, setDataUrl] = useState('');
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    const SIZE = 1080;
    const canvas = document.createElement('canvas');
    canvas.width = SIZE; canvas.height = SIZE;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    // Background
    const bg = ctx.createLinearGradient(0, 0, SIZE, SIZE);
    bg.addColorStop(0, '#2C1F0E'); bg.addColorStop(1, '#4A2E14');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, SIZE, SIZE);
    // Dot texture
    ctx.fillStyle = 'rgba(255,255,255,0.018)';
    for (let x = 0; x < SIZE; x += 40) for (let y = 0; y < SIZE; y += 40) { ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill(); }
    // Gold borders
    ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.strokeRect(24, 24, SIZE - 48, SIZE - 48);
    ctx.strokeStyle = 'rgba(184,134,11,0.3)'; ctx.lineWidth = 1; ctx.strokeRect(38, 38, SIZE - 76, SIZE - 76);
    // Cross watermark
    ctx.save(); ctx.globalAlpha = 0.055; ctx.strokeStyle = '#F0D98A'; ctx.lineWidth = 110;
    ctx.beginPath(); ctx.moveTo(SIZE/2, SIZE/2 - 210); ctx.lineTo(SIZE/2, SIZE/2 + 210); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(SIZE/2 - 210, SIZE/2 - 70); ctx.lineTo(SIZE/2 + 210, SIZE/2 - 70); ctx.stroke();
    ctx.restore();
    // Logo
    ctx.fillStyle = C.gold; ctx.font = '500 58px Georgia,serif'; ctx.textAlign = 'center';
    ctx.fillText('✝  MANNA', SIZE/2, 120);
    ctx.fillStyle = 'rgba(240,217,138,0.45)'; ctx.font = '300 22px sans-serif';
    ctx.fillText('DAILY BREAD FOR THE SOUL', SIZE/2, 158);
    // Top divider
    ctx.strokeStyle = 'rgba(184,134,11,0.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(110, 188); ctx.lineTo(SIZE - 110, 188); ctx.stroke();
    // Theme label
    ctx.fillStyle = C.goldLight; ctx.font = '700 28px sans-serif';
    ctx.fillText(title.toUpperCase(), SIZE/2, 248);
    // Verse — word wrap
    ctx.fillStyle = '#FBF6EC'; ctx.font = 'italic 500 50px Georgia,serif';
    const words = (`"${verse}"`).split(' ');
    const maxW = SIZE - 160; let line = ''; let y = 370;
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, SIZE/2, y); line = word; y += 70; }
      else line = test;
    }
    ctx.fillText(line, SIZE/2, y); y += 80;
    // Reference
    ctx.fillStyle = C.gold; ctx.font = '700 30px sans-serif';
    ctx.fillText(`— ${verseRef}`, SIZE/2, y);
    // Bottom
    ctx.strokeStyle = 'rgba(184,134,11,0.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(110, SIZE - 115); ctx.lineTo(SIZE - 110, SIZE - 115); ctx.stroke();
    ctx.fillStyle = 'rgba(240,217,138,0.35)'; ctx.font = '300 20px sans-serif';
    ctx.fillText('mannaapp.daily  •  Open the Word every morning', SIZE/2, SIZE - 72);
    setDataUrl(canvas.toDataURL('image/png'));
    setGenerating(false);
  }, []);

  function download() { const a = document.createElement('a'); a.href = dataUrl; a.download = 'manna-verse.png'; a.click(); }
  async function share() {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'manna-verse.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: 'Manna - Daily Verse' });
      else download();
    } catch { download(); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: C.ink, borderRadius: 20, overflow: 'hidden', maxWidth: 380, width: '100%', border: `1px solid ${C.gold}` }} onClick={e => e.stopPropagation()} className="slide-up">
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(184,134,11,0.25)' }}>
          <span style={{ fontFamily: F.serif, color: C.goldPale, fontSize: 18 }}>Share Verse Card</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.warmGray, cursor: 'pointer' }}><XIcon /></button>
        </div>
        <div style={{ padding: 20 }}>
          {generating ? (
            <div style={{ height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div style={{ width: 40, height: 40, border: `3px solid ${C.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontFamily: F.serif, color: C.warmGray, fontStyle: 'italic' }}>Crafting your card...</span>
            </div>
          ) : <img src={dataUrl} alt="Verse card" style={{ width: '100%', borderRadius: 10, marginBottom: 16 }} />}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={download} disabled={generating} style={{ flex: 1, padding: 13, background: C.forest, border: 'none', borderRadius: 10, color: '#fff', fontFamily: F.sans, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: generating ? 0.5 : 1 }}>
              <DownloadIcon /> Download
            </button>
            <button onClick={share} disabled={generating} style={{ flex: 1, padding: 13, background: `linear-gradient(135deg,${C.gold},${C.sienna})`, border: 'none', borderRadius: 10, color: C.ink, fontFamily: F.sans, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: generating ? 0.5 : 1 }}>
              <ShareIcon /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: TODAY
// ═══════════════════════════════════════════════════════════════════════════════
function TodayTab() {
  const todayStr = new Date().toDateString();
  const yesterdayStr = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toDateString(); })();
  const [marked, setMarked] = useState(() => ls.get('manna_today_date') === todayStr);
  const [streak, setStreak] = useState(() => {
    const raw = parseInt(ls.get('manna_streak', '0'), 10) || 0;
    const lastDate = ls.get('manna_today_date');
    if (lastDate !== todayStr && lastDate !== yesterdayStr && lastDate !== '') return 0;
    return raw;
  });
  const [showReflection, setShowReflection] = useState(false);
  const [audioActive, setAudioActive] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(() => { const b = ls.getJ<string[]>('manna_bookmarks', []); return b.some((bk: any) => bk.ref === todayDevo.ref); });
  const [verseKey, setVerseKey] = useState(0);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneStreak, setMilestoneStreak] = useState(0);
  const todayStr2 = new Date().toDateString();
  const [checkedIn, setCheckedIn] = useState(() => ls.get('manna_checkin_date') === todayStr2);
  const [checkinMood, setCheckinMood] = useState(() => ls.get('manna_checkin_mood'));
  const weeklyTheme = getWeeklyTheme();
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const c = useC();
  useEffect(() => () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current); }, []);

  function copyVerse() {
    const text = '"' + todayDevo.verse + '" — ' + todayDevo.ref;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      setCopied(true);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2500);
    });
  }

  function toggleBookmark() {
    const bookmarks = ls.getJ<any[]>('manna_bookmarks', []);
    const exists = bookmarks.some((b: any) => b.ref === todayDevo.ref);
    const updated = exists
      ? bookmarks.filter((b: any) => b.ref !== todayDevo.ref)
      : [...bookmarks, { verse: todayDevo.verse, ref: todayDevo.ref, title: todayDevo.title, saved: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }];
    ls.setJ('manna_bookmarks', updated);
    setBookmarked(!exists);
  }

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  function doCheckin(moodLabel: string) {
    lsSet('manna_checkin_date', todayStr2);
    lsSet('manna_checkin_mood', moodLabel);
    setCheckinMood(moodLabel);
    setCheckedIn(true);
  }

  function handleMark() {
    if (marked) return;
    setMarked(true); const s = streak + 1; setStreak(s);
    ls.set('manna_today_date', todayStr); ls.set('manna_streak', String(s));
    // Check milestone
    if (MILESTONE_DAYS.includes(s)) {
      const shownKey = 'manna_milestone_' + s;
      if (!ls.get(shownKey)) { ls.set(shownKey, 'true'); setMilestoneStreak(s); setShowMilestone(true); }
    }
  }

  return (
    <div style={{ padding: '0 0 140px' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg,' + c.burgundy + ' 0%,' + c.ink + ' 100%)', padding: '48px 24px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(255,255,255,.5) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(255,255,255,.5) 60px)' }} />
        <p style={{ fontFamily: F.serif, color: c.goldPale, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8, opacity: 0.8 }}>{dateStr}</p>
        <h1 style={{ fontFamily: F.serif, color: c.cream, fontSize: 30, fontWeight: 500, lineHeight: 1.2, marginBottom: 12 }}>{todayDevo.title}</h1>
        <span style={{ background: c.gold, color: c.ink, fontSize: 11, fontWeight: 700, letterSpacing: 2, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' }}>{todayDevo.theme}</span>
      </div>

      {/* Weekly Arc Card */}
      <div style={{ margin: '12px 16px 0', background: 'rgba(107,31,42,0.07)', borderRadius: 14, padding: '14px 18px', border: '1px solid rgba(107,31,42,0.15)' }}>
        <p style={{ fontFamily: F.sans, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: c.burgundy, marginBottom: 6, opacity: 0.8 }}>This Week</p>
        <p style={{ fontFamily: F.serif, fontSize: 22, color: c.ink, fontWeight: 500, marginBottom: 2 }}>{weeklyTheme.theme}</p>
        <p style={{ fontFamily: F.sans, fontSize: 11, color: c.gold, letterSpacing: 1, marginBottom: 6 }}>{weeklyTheme.ref}</p>
        <p style={{ fontFamily: F.serif, fontSize: 13, color: c.inkLight, fontStyle: 'italic', lineHeight: 1.6 }}>{weeklyTheme.desc}</p>
      </div>

      {/* Emotional Check-In */}
      {!checkedIn && (
        <div className="fade-in" style={{ margin: '12px 16px 0', background: c.cream, borderRadius: 14, padding: '14px 16px', border: '1px solid ' + c.border }}>
          <p style={{ fontFamily: F.serif, fontSize: 13, color: c.warmGray, fontStyle: 'italic', marginBottom: 12 }}>How are you arriving today?</p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {CHECK_IN_MOODS.map((m) => (
              <button key={m.label} onClick={() => doCheckin(m.label)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 4px' }}>
                <span style={{ fontSize: 22 }}>{m.emoji}</span>
                <span style={{ fontFamily: F.sans, fontSize: 9, color: c.warmGray }}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scripture Card */}
      <div key={verseKey} style={{ margin: '0 16px', marginTop: -20, background: c.cream, borderRadius: 16, padding: '28px 24px', boxShadow: '0 4px 32px rgba(44,31,14,0.15)', border: '1px solid ' + c.border }} className={verseKey > 0 ? 'verse-swap' : 'fade-in'}>
        <div style={{ textAlign: 'center', color: c.gold, marginBottom: 16 }}><CrossIcon size={24} /></div>
        <p style={{ fontFamily: F.serif, fontSize: 20, lineHeight: 1.7, color: c.ink, textAlign: 'center', fontStyle: 'italic', marginBottom: 16 }}>"{todayDevo.verse}"</p>
        <p style={{ fontFamily: F.sans, fontSize: 13, color: c.warmGray, textAlign: 'center', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 }}>— {todayDevo.ref}</p>

        {/* Actions row 1 */}
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={() => setAudioActive(a => !a)} style={{ flex: 1, padding: 10, background: audioActive ? c.ink : 'transparent', border: '1px solid ' + (audioActive ? c.gold : c.border), borderRadius: 10, cursor: 'pointer', color: audioActive ? c.gold : c.inkLight, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: F.sans, fontSize: 12, fontWeight: 700 }}>
            <SpeakerIcon size={15} />{audioActive ? 'Stop' : 'Listen'}
          </button>
          <button onClick={copyVerse} style={{ flex: 1, padding: 10, background: copied ? c.forest : 'transparent', border: '1px solid ' + (copied ? c.forest : c.border), borderRadius: 10, cursor: 'pointer', color: copied ? '#fff' : c.inkLight, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: F.sans, fontSize: 12, fontWeight: 700, transition: 'all 0.3s' }}>
            <CopyIcon size={14} />{copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={() => setShareOpen(true)} style={{ flex: 1, padding: 10, background: 'transparent', border: '1px solid ' + c.border, borderRadius: 10, cursor: 'pointer', color: c.inkLight, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: F.sans, fontSize: 12, fontWeight: 700 }}>
            <ShareIcon size={15} />Share
          </button>
        </div>
        {/* Actions row 2 */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={() => setShowReflection(r => !r)} style={{ flex: 1, padding: 10, background: 'transparent', border: '1px solid ' + c.border, borderRadius: 10, cursor: 'pointer', color: c.inkLight, fontFamily: F.sans, fontSize: 12, fontWeight: 700 }}>
            {showReflection ? 'Hide Reflection' : '✦ Reflect'}
          </button>
        </div>

        {showReflection && (
          <div style={{ marginTop: 12, padding: 16, background: c.parchmentDark, borderRadius: 10, borderLeft: '3px solid ' + c.gold }} className="fade-in">
            {checkedIn && checkinMood && (() => {
              const m = CHECK_IN_MOODS.find(m => m.label === checkinMood);
              return m ? <p style={{ fontFamily: F.serif, fontSize: 13, color: c.gold, marginBottom: 8, fontStyle: 'italic' }}>{m.prefix}</p> : null;
            })()}
            <p style={{ fontFamily: F.serif, fontSize: 16, lineHeight: 1.7, color: c.inkLight, fontStyle: 'italic' }}>{todayDevo.reflection}</p>
          </div>
        )}
      </div>

      {/* Daily Walk */}
      <div style={{ margin: '16px 16px 0', background: c.cream, borderRadius: 16, padding: '20px 24px', border: '1px solid ' + c.border }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p style={{ fontFamily: F.sans, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: c.warmGray, marginBottom: 4 }}>Daily Walk</p>
            <p style={{ fontFamily: F.serif, fontSize: 20, color: c.ink, fontWeight: 500, lineHeight: 1.3 }}>
              {streak === 0 ? 'Begin your journey' :
               streak === 1 ? 'Day one of faith 🕊️' :
               streak < 7  ? streak + ' days growing' :
               streak === 7 ? 'One week faithful 🕊️' :
               streak === 14 ? 'A fortnight of grace' :
               streak === 30 ? 'Thirty days with God 🌾' :
               streak >= 100 ? 'A hundred days of bread 🌾' :
               streak + ' days walking'}
            </p>
          </div>
          <div style={{ color: c.gold, opacity: 0.85 }}><CrossIcon size={28} /></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['S','M','T','W','T','F','S'].map((d, i) => {
            const active = i < streak % 7;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: active ? c.gold : c.parchmentDark, display: 'flex', alignItems: 'center', justifyContent: 'center', border: active ? 'none' : '1px solid ' + c.border }}>
                  {active && <span style={{ color: c.ink, fontSize: 14 }}>✓</span>}
                </div>
                <span style={{ fontSize: 10, color: c.warmGray, fontFamily: F.sans }}>{d}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mark as Read */}
      <div style={{ margin: '16px 16px 0' }}>
        <button onClick={handleMark} style={{ width: '100%', padding: 18, borderRadius: 14, background: marked ? c.forest : 'linear-gradient(135deg,' + c.gold + ',' + c.sienna + ')', border: 'none', color: marked ? '#fff' : c.ink, fontFamily: F.sans, fontSize: 15, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', cursor: marked ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          {marked ? '✓  Completed Today' : 'Mark as Read'}
        </button>
      </div>

      <BookmarksSection />
      {showMilestone && <MilestonModal streak={milestoneStreak} onClose={() => setShowMilestone(false)} />}
      {audioActive && <AudioPlayerBar text={`${todayDevo.verse}. From ${todayDevo.ref}. Reflection: ${todayDevo.reflection}`} onClose={() => setAudioActive(false)} />}
      {shareOpen && <ShareModal verse={todayDevo.verse} verseRef={todayDevo.ref} title={todayDevo.title} onClose={() => setShareOpen(false)} />}
    </div>
  );
}


// ─── BOOKMARKS SECTION (rendered in TodayTab when user scrolls) ──────────────
function BookmarksSection() {
  const c = useC();
  const [bookmarks, setBookmarks] = useState(() => ls.getJ<any[]>('manna_bookmarks', []));

  function remove(ref: string) {
    const updated = bookmarks.filter((b: any) => b.ref !== ref);
    setBookmarks(updated); ls.setJ('manna_bookmarks', updated);
  }

  if (bookmarks.length === 0) return (
    <div style={{ margin: '16px 16px 0', background: c.cream, borderRadius: 16, padding: '28px 20px', border: '1px solid ' + c.border, textAlign: 'center' }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={c.goldLight} strokeWidth="1.2" style={{ marginBottom: 14, opacity: 0.6 }}>
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      <p style={{ fontFamily: F.serif, fontSize: 16, color: c.warmGray, fontStyle: 'italic' }}>No bookmarks yet</p>
      <p style={{ fontFamily: F.sans, fontSize: 12, color: c.warmGray, marginTop: 6 }}>Tap the bookmark icon on any verse to save it here.</p>
    </div>
  );

  return (
    <div style={{ margin: '16px 16px 0' }}>
      <p style={{ fontFamily: F.sans, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: c.warmGray, marginBottom: 12 }}>Saved Verses</p>
      {bookmarks.map((b: any) => (
        <div key={b.ref} className="fade-in" style={{ background: c.cream, border: '1px solid ' + c.border, borderRadius: 14, padding: '16px 18px', marginBottom: 10 }}>
          <p style={{ fontFamily: F.serif, fontSize: 15, fontStyle: 'italic', color: c.ink, lineHeight: 1.7, marginBottom: 8 }}>"{b.verse}"</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: F.sans, fontSize: 11, color: c.gold, letterSpacing: 1, fontWeight: 700 }}>— {b.ref}</p>
            <button onClick={() => remove(b.ref)} style={{ background: 'transparent', border: 'none', color: c.warmGray, cursor: 'pointer', fontSize: 12, fontFamily: F.sans }}>Remove</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: BIBLE CHAT
// ═══════════════════════════════════════════════════════════════════════════════
const WELCOME_MSG = { role: 'assistant', text: "Peace be with you. I'm Logos, your gentle Bible companion. Ask me anything — a verse, a theology question, or simply share what's on your heart. I'm here to walk with you through Scripture. ✝" };

function BibleChatTab() {
  const c = useC();
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Fix 3 & 4: Clear conversation, reset to welcome, chips reappear
  function clearConversation() {
    setMessages([WELCOME_MSG]);
    setInput('');
    setLoading(false);
    window.speechSynthesis?.cancel();
  }

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const history = messages.slice(1).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text,
      }));
      history.push({ role: 'user', content: userMsg });
      // Calls Vercel serverless function — API key lives securely on the server
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error((e as {error?: string})?.error || 'Server error ' + res.status);
      }
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: data.reply || "I wasn't able to retrieve a response.",
      }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', text: '⚠ ' + e.message }]);
    }
    setLoading(false);
  }

  // Fixed layout — fills full screen minus tab bar, input always visible
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '430px',
      bottom: '60px',
      display: 'flex',
      flexDirection: 'column',
      background: c.parchment,
      zIndex: 5,
    }}>

      {/* ── Logos header — padded to clear sticky app header ── */}
      <div style={{
        padding: '84px 16px 12px',
        background: c.cream,
        borderBottom: '1px solid ' + c.border,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,' + c.burgundy + ',' + c.ink + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.goldPale, flexShrink: 0 }}>
          <CrossIcon size={17} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: F.serif, fontSize: 16, color: c.ink, fontWeight: 500, lineHeight: 1.2 }}>Logos — Spiritual Director</p>
          <p style={{ fontFamily: F.serif, fontSize: 10, color: c.warmGray, fontStyle: 'italic' }}>Not a search engine. A contemplative companion.</p>
        </div>
        {/* Fix 3: New Conversation button */}
        {messages.length > 1 && (
          <button
            onClick={clearConversation}
            style={{
              background: 'transparent',
              border: '1px solid ' + c.border,
              borderRadius: 20,
              padding: '5px 12px',
              fontFamily: F.sans,
              fontSize: 11,
              color: c.warmGray,
              cursor: 'pointer',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            ↺ New
          </button>
        )}
      </div>

      {/* Fix 4: Chips reappear when messages.length === 1 (after clear too) */}
      {messages.length === 1 && (
        <div style={{
          padding: '10px 12px 6px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          flexShrink: 0,
          background: c.parchment,
        }}>
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => send(q)}
              style={{
                background: c.cream,
                border: '1px solid ' + c.border,
                borderRadius: 20,
                padding: '5px 11px',
                fontFamily: F.sans,
                fontSize: 11,
                color: c.inkLight,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Messages — ONLY this div scrolls */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 12px 8px',
        minHeight: 0,
      }}>
        {messages.map((m, i) => (
          <div
            key={i}
            className="fade-in"
            style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 12,
            }}
          >
            {m.role === 'assistant' && (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: c.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8, flexShrink: 0, marginTop: 4 }}>
                <span style={{ color: c.gold, fontSize: 12 }}>✝</span>
              </div>
            )}
            <div style={{
              maxWidth: '82%',
              padding: '9px 13px',
              borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: m.role === 'user'
                ? 'linear-gradient(135deg,' + c.burgundy + ',' + c.ink + ')'
                : c.cream,
              color: m.role === 'user' ? '#fff' : c.ink,
              fontFamily: m.role === 'user' ? F.serif : F.sans,
              fontSize: m.role === 'user' ? 14 : 13,
              lineHeight: m.role === 'user' ? 1.65 : 1.7,
              border: m.role === 'assistant' ? '1px solid ' + c.border : 'none',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: c.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: c.gold, fontSize: 12 }}>✝</span>
            </div>
            <div style={{ background: c.cream, border: '1px solid ' + c.border, borderRadius: '16px 16px 16px 4px', padding: '10px 16px', display: 'flex', gap: 5 }}>
              {[0,1,2].map(j => (
                <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: c.warmGray, animation: 'pulse 1.2s ease infinite', animationDelay: j * 0.2 + 's' }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input row — always visible above tab bar */}
      <div style={{
        flexShrink: 0,
        padding: '10px 12px 20px',
        background: c.cream,
        borderTop: '1px solid ' + c.border,
        display: 'flex',
        gap: 8,
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
          placeholder="Ask about Scripture..."
          style={{
            flex: 1,
            background: c.parchment,
            border: '1px solid ' + c.border,
            borderRadius: 22,
            padding: '10px 16px',
            fontFamily: F.serif,
            fontSize: 14,
            color: c.ink,
            outline: 'none',
            minWidth: 0,
          }}
        />
        <button
          onClick={() => send(input)}
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: c.ink,
            border: 'none',
            color: c.gold,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: JOURNAL
// ═══════════════════════════════════════════════════════════════════════════════
function JournalTab() {
  const c = useC();
  const [entry, setEntry] = useState('');
  const [saved, setSaved] = useState(false);
  const [entries, setEntries] = useState(() => ls.getJ<any[]>('manna_journal', []));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  function saveEntry() {
    if (!entry.trim()) return;
    const e = { id: Date.now(), text: entry, date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) };
    const updated = [e, ...entries]; setEntries(updated); ls.setJ('manna_journal', updated);
    setEntry(''); setSaved(true);
    timerRef.current = setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ padding: '20px 14px 100px' }}>
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontFamily: F.sans, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: c.warmGray, marginBottom: 4 }}>Prayer Journal</p>
        <h2 style={{ fontFamily: F.serif, fontSize: 24, color: c.ink, fontWeight: 500 }}>Speak, Lord.</h2>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {JOURNAL_PROMPTS.map((p, i) => (
          <button key={i} onClick={() => setEntry(e => e ? e + '\n\n' + p : p)} style={{ background: c.cream, border: '1px solid ' + c.border, borderRadius: 20, padding: '5px 12px', fontFamily: F.serif, fontSize: 12, fontStyle: 'italic', color: c.inkLight, cursor: 'pointer' }}>{p}</button>
        ))}
      </div>
      <div style={{ background: c.cream, border: '1px solid ' + c.border, borderRadius: 14, padding: '16px 16px 16px 20px', marginBottom: 14, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 16, left: 14, width: 1, height: 'calc(100% - 32px)', background: c.goldPale }} />
        <textarea value={entry} onChange={e => setEntry(e.target.value)} placeholder="Write freely... this is between you and God." style={{ width: '100%', minHeight: 160, background: 'transparent', border: 'none', outline: 'none', fontFamily: F.serif, fontSize: 16, fontStyle: 'italic', color: c.ink, lineHeight: 1.8, paddingLeft: 12, resize: 'none', borderRadius: 0 }} />
      </div>
      <button onClick={saveEntry} style={{ width: '100%', padding: 15, borderRadius: 12, background: saved ? c.forest : c.ink, border: 'none', color: saved ? '#fff' : c.gold, fontFamily: F.sans, fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer' }}>
        {saved ? '✓  Saved' : 'Save Entry'}
      </button>
      {entries.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <p style={{ fontFamily: F.sans, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: c.warmGray, marginBottom: 14 }}>Past Entries</p>
          {entries.map((e: any) => (
            <div key={e.id} className="fade-in" style={{ background: c.cream, border: '1px solid ' + c.border, borderRadius: 12, padding: 16, marginBottom: 10 }}>
              <p style={{ fontFamily: F.sans, fontSize: 11, color: c.warmGray, marginBottom: 6, letterSpacing: 1 }}>{e.date}</p>
              <p style={{ fontFamily: F.serif, fontSize: 14, fontStyle: 'italic', color: c.ink, lineHeight: 1.7 }}>{e.text.length > 200 ? e.text.slice(0, 200) + '...' : e.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: READING PLAN
// ═══════════════════════════════════════════════════════════════════════════════
function ReadingPlanTab() {
  const c = useC();
  const [completed, setCompleted] = useState(() => ls.getJ<number[]>('manna_reading', []));
  const heatmap = (() => {
    const dates = new Set(ls.getJ<string[]>('manna_reading_dates', []));
    return Array.from({ length: 28 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (27 - i)); return { date: d.toDateString(), active: dates.has(d.toDateString()) }; });
  })();

  function toggle(day: number) {
    const updated = completed.includes(day) ? completed.filter(d => d !== day) : [...completed, day];
    setCompleted(updated); ls.setJ('manna_reading', updated);
    if (!completed.includes(day)) {
      const dates = ls.getJ<string[]>('manna_reading_dates', []);
      const t = new Date().toDateString();
      if (!dates.includes(t)) ls.setJ('manna_reading_dates', [...dates, t]);
    }
  }

  const pct = Math.round((completed.length / READING_PLAN.length) * 100);

  return (
    <div style={{ padding: '20px 14px 100px' }}>
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontFamily: F.sans, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: c.warmGray, marginBottom: 4 }}>90-Day Plan</p>
        <h2 style={{ fontFamily: F.serif, fontSize: 24, color: c.ink, fontWeight: 500 }}>Through the Word</h2>
      </div>
      {completed.length === 0 && (
        <div className="fade-in" style={{ background: c.cream, border: '1px solid ' + c.border, borderRadius: 16, padding: '28px 20px', marginBottom: 16, textAlign: 'center' }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke={c.goldLight} strokeWidth="1.1" strokeLinecap="round" style={{ marginBottom: 12, opacity: 0.7 }}>
            <line x1="12" y1="2" x2="12" y2="22"/>
            <line x1="2" y1="8" x2="22" y2="8"/>
            <circle cx="12" cy="14" r="6" strokeWidth="0.8" strokeDasharray="2 2"/>
          </svg>
          <p style={{ fontFamily: F.serif, fontSize: 17, color: c.ink, marginBottom: 6 }}>Your journey begins today</p>
          <p style={{ fontFamily: F.sans, fontSize: 12, color: c.warmGray, lineHeight: 1.6 }}>Tap any reading below to mark it complete and begin building your 90-day habit.</p>
        </div>
      )}
      <div style={{ background: c.cream, borderRadius: 14, padding: 18, marginBottom: 14, border: '1px solid ' + c.border }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: F.sans, fontSize: 13, color: c.inkLight }}>Progress</span>
          <span style={{ fontFamily: F.serif, fontSize: 15, color: c.ink, fontWeight: 500 }}>{completed.length} / {READING_PLAN.length} days</span>
        </div>
        <div style={{ height: 8, background: c.parchmentDark, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: pct + '%', height: '100%', background: 'linear-gradient(90deg,' + c.gold + ',' + c.sienna + ')', borderRadius: 4, transition: 'width .5s ease' }} />
        </div>
        <p style={{ fontFamily: F.sans, fontSize: 12, color: c.inkLight, marginTop: 8 }}>{pct}% complete</p>
      </div>
      <div style={{ background: c.cream, borderRadius: 14, padding: 18, marginBottom: 14, border: '1px solid ' + c.border }}>
        <p style={{ fontFamily: F.sans, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: c.warmGray, marginBottom: 12 }}>28-Day Activity</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 5 }}>
          {heatmap.map((d, i) => <div key={i} style={{ aspectRatio: '1', borderRadius: 4, background: d.active ? c.gold : c.parchmentDark, opacity: d.active ? 1 : 0.5 }} title={d.date} />)}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: c.parchmentDark }} /><span style={{ fontFamily: F.sans, fontSize: 10, color: c.inkLight }}>No reading</span>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: c.gold, marginLeft: 8 }} /><span style={{ fontFamily: F.sans, fontSize: 10, color: c.inkLight }}>Completed</span>
        </div>
      </div>
      <p style={{ fontFamily: F.sans, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: c.warmGray, marginBottom: 12 }}>Daily Readings</p>
      {READING_PLAN.map(item => {
        const done = completed.includes(item.day);
        return (
          <div key={item.day} onClick={() => toggle(item.day)} style={{ background: c.cream, border: '1px solid ' + (done ? c.gold : c.border), borderRadius: 12, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: done ? c.gold : c.parchmentDark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {done ? <span style={{ color: c.ink, fontWeight: 700, fontSize: 15 }}>✓</span> : <span style={{ fontFamily: F.sans, fontSize: 12, color: c.warmGray }}>{item.day}</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: F.serif, fontSize: 15, color: done ? c.warmGray : c.ink, textDecoration: done ? 'line-through' : 'none', marginBottom: 2 }}>{item.book} {item.chapter}</p>
              <p style={{ fontFamily: F.sans, fontSize: 11, color: c.warmGray }}>{item.theme}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}


// ─── MOOD-BASED PRAYER GENERATOR ─────────────────────────────────────────────
const MOODS = [
  { emoji: '🙏', label: 'Grateful', prompt: 'Write a short, warm prayer of thanksgiving for someone feeling deeply grateful today. Include a relevant Bible verse.' },
  { emoji: '😔', label: 'Anxious', prompt: 'Write a gentle, comforting prayer for someone feeling anxious and worried. Include a relevant Bible verse about peace.' },
  { emoji: '✨', label: 'Hopeful', prompt: 'Write an uplifting prayer for someone feeling hopeful and expectant about the future. Include a relevant Bible verse.' },
  { emoji: '💙', label: 'Struggling', prompt: 'Write a compassionate prayer for someone who is struggling and going through a difficult season. Include a relevant Bible verse.' },
  { emoji: '😊', label: 'Joyful', prompt: 'Write a celebratory prayer of joy and praise for someone feeling joyful today. Include a relevant Bible verse.' },
];

function MoodPrayer() {
  const c = useC();
  const [activeMood, setActiveMood] = useState<number | null>(null);
  const [prayer, setPrayer] = useState('');
  const [loading, setLoading] = useState(false);

  async function generatePrayer(idx: number) {
    setActiveMood(idx);
    setPrayer('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: MOODS[idx].prompt }] }),
      });
      const data = await res.json();
      setPrayer(data.reply || 'Unable to generate prayer. Please try again.');
    } catch { setPrayer('Unable to generate prayer. Please try again.'); }
    setLoading(false);
  }

  return (
    <div style={{ margin: '0 0 20px', background: c.cream, borderRadius: 16, padding: '18px 16px', border: '1px solid ' + c.border }}>
      <p style={{ fontFamily: F.sans, fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', color: c.warmGray, marginBottom: 14 }}>How are you feeling today?</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: prayer || loading ? 16 : 0, flexWrap: 'wrap' }}>
        {MOODS.map((m, i) => (
          <button key={i} onClick={() => generatePrayer(i)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 14px', borderRadius: 14, border: '1px solid ' + (activeMood === i ? c.gold : c.border), background: activeMood === i ? 'rgba(184,134,11,0.1)' : 'transparent', cursor: 'pointer', transition: 'all 0.2s', minWidth: 62 }}>
            <span style={{ fontSize: 22 }}>{m.emoji}</span>
            <span style={{ fontFamily: F.sans, fontSize: 10, color: activeMood === i ? c.gold : c.warmGray, fontWeight: activeMood === i ? 700 : 400 }}>{m.label}</span>
          </button>
        ))}
      </div>
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0' }}>
          <div style={{ width: 20, height: 20, border: '2px solid ' + c.gold, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          <span style={{ fontFamily: F.serif, fontSize: 14, color: c.warmGray, fontStyle: 'italic' }}>Composing your prayer...</span>
        </div>
      )}
      {prayer && !loading && (
        <div className="fade-in" style={{ background: c.parchmentDark, borderRadius: 12, padding: '14px 16px', borderLeft: '3px solid ' + c.gold }}>
          <p style={{ fontFamily: F.serif, fontSize: 15, lineHeight: 1.8, color: c.ink, fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>{prayer}</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: PRAYER WALL
// ═══════════════════════════════════════════════════════════════════════════════
function PrayerWallTab() {
  const c = useC();
  const [prayers, setPrayers] = useState(() => ls.getJ<any[]>('manna_prayers', COMMUNITY_PRAYERS_DEFAULT));
  const [prayed, setPrayed] = useState(() => ls.getJ<number[]>('manna_prayed', []));
  const [showForm, setShowForm] = useState(false);
  const [newPrayer, setNewPrayer] = useState('');
  const [category, setCategory] = useState('Prayer');
  const [shareItem, setShareItem] = useState<any>(null);

  function togglePraying(id: number) {
    const hasPrayed = prayed.includes(id);
    if (hasPrayed) return; // can only pray once
    const up = prayers.map(p => p.id === id ? { ...p, hearts: p.hearts + 1 } : p);
    const upPrayed = [...prayed, id];
    setPrayed(upPrayed); setPrayers(up);
    ls.setJ('manna_prayed', upPrayed); ls.setJ('manna_prayers', up);
  }

  function submitPrayer() {
    if (!newPrayer.trim()) return;
    const p = { id: Date.now(), author: 'You', text: newPrayer, time: 'Just now', hearts: 0, category };
    const updated = [p, ...prayers]; setPrayers(updated); ls.setJ('manna_prayers', updated);
    setNewPrayer(''); setShowForm(false);
  }

  return (
    <div style={{ padding: '24px 16px 100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
        <div>
          <p style={{ fontFamily: F.sans, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: c.warmGray, marginBottom: 4 }}>Community</p>
          <h2 style={{ fontFamily: F.serif, fontSize: 26, color: c.ink, fontWeight: 500 }}>Prayer Wall</h2>
        </div>
        <button onClick={() => setShowForm(f => !f)} style={{ background: c.ink, border: 'none', color: c.gold, fontFamily: F.sans, fontSize: 13, fontWeight: 700, padding: '10px 18px', borderRadius: 24, cursor: 'pointer' }}>+ Add Prayer</button>
      </div>
      <MoodPrayer />
      <p style={{ fontFamily: F.serif, fontSize: 12, fontStyle: 'italic', color: c.warmGray, marginBottom: 14, lineHeight: 1.6 }}>Sharing your prayer invites others to pray with you — not for performance.</p>

      {showForm && (
        <div className="fade-in" style={{ background: c.cream, border: '1px solid ' + c.border, borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <p style={{ fontFamily: F.serif, fontSize: 14, color: c.warmGray, marginBottom: 12, fontStyle: 'italic' }}>"...pray for one another..." — James 5:16</p>
          <textarea value={newPrayer} onChange={e => setNewPrayer(e.target.value)} placeholder="Share your prayer request..." style={{ width: '100%', minHeight: 100, background: c.parchment, border: '1px solid ' + c.border, borderRadius: 10, padding: 14, fontFamily: F.serif, fontSize: 15, fontStyle: 'italic', color: c.ink, outline: 'none', resize: 'none', marginBottom: 12 }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {CATEGORIES.map(cat => <button key={cat} onClick={() => setCategory(cat)} style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid ' + (category === cat ? catColors[cat] : c.border), background: category === cat ? catColors[cat] : 'transparent', color: category === cat ? '#fff' : c.inkLight, fontFamily: F.sans, fontSize: 12, cursor: 'pointer' }}>{cat}</button>)}
          </div>
          <button onClick={submitPrayer} style={{ width: '100%', padding: 14, borderRadius: 10, background: c.ink, border: 'none', color: c.gold, fontFamily: F.sans, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Submit Prayer</button>
        </div>
      )}

      {prayers.map((p: any) => {
        const hasPrayed = prayed.includes(p.id);
        const catColor = catColors[p.category] || c.warmGray;
        return (
          <div key={p.id} className="fade-in" style={{ background: c.cream, border: '1px solid ' + c.border, borderRadius: 16, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: catColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: F.serif, fontSize: 14, color: catColor, fontWeight: 600 }}>{p.author[0]}</span>
                </div>
                <div>
                  <p style={{ fontFamily: F.sans, fontSize: 13, color: c.ink, fontWeight: 600 }}>{p.author}</p>
                  <p style={{ fontFamily: F.sans, fontSize: 11, color: c.warmGray }}>{p.time}</p>
                </div>
              </div>
              <span style={{ background: catColor + '22', color: catColor, fontSize: 11, fontFamily: F.sans, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{p.category}</span>
            </div>
            <p style={{ fontFamily: F.serif, fontSize: 15, lineHeight: 1.7, color: c.ink, marginBottom: 12, fontStyle: 'italic', wordBreak: 'break-word' }}>"{p.text}"</p>
            <div style={{ borderTop: '1px solid ' + c.border, paddingTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => togglePraying(p.id)} style={{ background: hasPrayed ? 'rgba(184,134,11,0.1)' : 'transparent', border: '1px solid ' + (hasPrayed ? c.gold : c.border), borderRadius: 20, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 5, cursor: hasPrayed ? 'default' : 'pointer', color: hasPrayed ? c.gold : c.warmGray, transition: 'all 0.2s' }}>
                <span style={{ fontSize: 13 }}>🙏</span><span style={{ fontFamily: F.sans, fontSize: 12, fontWeight: 600 }}>{p.hearts}</span>
              </button>
              <button onClick={() => setShareItem(p)} style={{ background: 'transparent', border: '1px solid ' + c.border, borderRadius: 20, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', color: c.warmGray }}>
                <ShareIcon /><span style={{ fontFamily: F.sans, fontSize: 11 }}>Share</span>
              </button>
              <span style={{ fontFamily: F.serif, fontSize: 13, color: c.warmGray, fontStyle: 'italic', marginLeft: 'auto' }}>🙏</span>
            </div>
          </div>
        );
      })}
      {shareItem && <ShareModal verse={shareItem.text} verseRef={`— ${shareItem.author}`} title="Community Prayer" onClose={() => setShareItem(null)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: 'today', label: 'Today', Icon: SunIcon },
  { id: 'chat', label: 'Chat', Icon: CrossIcon },
  { id: 'journal', label: 'Journal', Icon: PenIcon },
  { id: 'reading', label: 'Plan', Icon: BookIcon },
  { id: 'prayer', label: 'Pray', Icon: UsersIcon },
];

export default function App() {
  const [onboarded, setOnboarded] = useState(() => lsGet('manna_onboarded', '') === 'true');
  const [splash, setSplash] = useState(() => !sessionStorage.getItem('manna_launched'));
  const [activeTab, setActiveTab] = useState('today');
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);
  const [showNotifTime, setShowNotifTime] = useState(false);
  const [dark, setDark] = useState(() => lsGet('manna_dark', 'false') === 'true');

  const themeValue = { dark, toggle: () => setDark(d => { lsSet('manna_dark', String(!d)); return !d; }) };
  const c = dark ? DARK : C;

  // Dynamic global styles for dark mode
  const dynamicGS = GS + (dark ? `
    body { background: ${DARK.parchment} !important; color: ${DARK.ink} !important; }
  ` : '');

  useEffect(() => {
    const pref = lsGet('manna_notif', '');
    if (!pref && 'Notification' in window) {
      const t = setTimeout(() => setShowNotifPrompt(true), 3000);
      return () => clearTimeout(t);
    }
    if (pref === 'granted') {
      const h = parseInt(lsGet('manna_notif_hour', '7'), 10);
      const ap = lsGet('manna_notif_ampm', 'AM');
      let hour = h;
      if (ap === 'PM' && h !== 12) hour += 12;
      if (ap === 'AM' && h === 12) hour = 0;
      scheduleNotificationAt(hour);
    }
  }, []);

  const tabBg = dark ? 'rgba(26,15,6,0.97)' : 'rgba(245,239,224,0.96)';

  return (
    <ThemeCtx.Provider value={themeValue}>
      {!onboarded && <OnboardingScreen onDone={() => setOnboarded(true)} />}
      {onboarded && splash && <SplashScreen onDone={() => { sessionStorage.setItem('manna_launched', '1'); setSplash(false); }} />}
      <style>{dynamicGS}</style>
      <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: c.parchment, position: 'relative' }}>
        {/* Header */}
        <div style={{ padding: '48px 24px 0', background: c.parchment, position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid ' + c.border }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, background: c.ink, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: c.gold, fontSize: 14 }}>✝</span>
              </div>
              <span style={{ fontFamily: F.serif, fontSize: 20, color: c.ink, fontWeight: 600 }}>Manna</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Notification time setter */}
              <button onClick={() => setShowNotifTime(true)} title="Set reminder time" style={{ width: 32, height: 32, borderRadius: '50%', background: 'transparent', border: '1px solid ' + c.border, cursor: 'pointer', color: c.warmGray, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClockIcon size={15} />
              </button>
              {/* Dark mode toggle */}
              <button onClick={themeValue.toggle} title={dark ? 'Switch to Light' : 'Switch to Dark'} style={{ width: 32, height: 32, borderRadius: '50%', background: dark ? c.gold : 'transparent', border: '1px solid ' + (dark ? c.gold : c.border), cursor: 'pointer', color: dark ? c.ink : c.warmGray, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                {dark ? <SunSmallIcon size={15} /> : <MoonIcon size={15} />}
              </button>
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div style={{ overflowY: 'auto' }}>
          {activeTab === 'today' && <TodayTab />}
          {activeTab === 'chat' && <BibleChatTab />}
          {activeTab === 'journal' && <JournalTab />}
          {activeTab === 'reading' && <ReadingPlanTab />}
          {activeTab === 'prayer' && <PrayerWallTab />}
        </div>

        {/* Tab bar */}
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: tabBg, backdropFilter: 'blur(12px)', borderTop: '1px solid ' + c.border, display: 'flex', padding: '10px 0 20px', zIndex: 100 }}>
          {TABS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 0', color: active ? c.ink : c.warmGray, transition: 'color .2s' }}>
                <div style={{ position: 'relative' }}>
                  <Icon size={22} />
                  {active && <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: c.gold }} />}
                </div>
                <span style={{ fontFamily: F.sans, fontSize: 10, fontWeight: active ? 700 : 400, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {showNotifPrompt && <NotifPrompt onDone={() => setShowNotifPrompt(false)} />}
      {showNotifTime && <NotifTimeModal onClose={() => setShowNotifTime(false)} />}
    </ThemeCtx.Provider>
  );
}