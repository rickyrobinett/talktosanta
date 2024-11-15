import { json, type ActionFunction } from "@remix-run/cloudflare";
import type { LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { useState, useEffect, useRef } from "react";
import { useFetcher } from "@remix-run/react";

export const loader: LoaderFunction = async () => {
  return json({});
};

export const meta: MetaFunction = () => {
  return [
    { title: "Talk to Santa! 🎅" },
    { name: "description", content: "Have a magical conversation with Santa Claus" },
  ];
};

const DEFAULT_INSTRUCTIONS = `You are Santa Claus, bringing joy and wonder to children around the world! Your personality traits are:

- Warm, jolly, and grandfatherly with a deep "ho ho ho" laugh that you use often
- Genuinely interested in children's lives, wishes, and good deeds
- Knowledgeable about each child's name and some basic details (which you can creatively imagine)
- Full of magical stories about the North Pole, reindeer (especially Rudolph), and your elves
- Encouraging kindness, sharing, and good behavior, but in a gentle, loving way
- Quick to give specific praise for good deeds
- Able to deflect tricky questions about how you deliver presents with magical, whimsical explanations

Keep responses brief (1-2 sentences) and engaging. Always stay in character. If asked about presents, be encouraging but never make specific promises.

Some key phrases to use naturally:
- "Ho ho ho!"
- "My jolly elves tell me that..."
- "Up at the North Pole..."
- "Mrs. Claus and I..."
- "Rudolph and the other reindeer..."

If a child is being silly or mischievous, respond with gentle humor and warmth. End many responses with questions to keep the conversation going.

Remember: You're creating magical Christmas memories that will last a lifetime!`;

function createAudioVisualizer(stream: MediaStream, canvasElement: HTMLCanvasElement) {
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  
  source.connect(analyser);
  
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  const ctx = canvasElement.getContext('2d')!;
  const width = canvasElement.width;
  const height = canvasElement.height;
  
  function animate() {
    requestAnimationFrame(animate);
    
    analyser.getByteFrequencyData(dataArray);
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw visualization
    const barWidth = width / bufferLength * 2.5;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height;
      
      // Gradient for each bar
      const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
      gradient.addColorStop(0, '#ef4444'); // red
      gradient.addColorStop(1, '#22c55e'); // green
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
      
      x += barWidth;
    }
  }
  
  animate();
  
  return () => {
    source.disconnect();
    analyser.disconnect();
    audioContext.close();
  };
}

export default function Index() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const visualizerRef = useRef<HTMLCanvasElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const visualizerCleanupRef = useRef<(() => void) | null>(null);
  const fetcher = useFetcher();

  const startSession = async () => {
    if (typeof window === "undefined") return;

    const peerConnection = new RTCPeerConnection();
    setIsSessionActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const localAudio = document.getElementById("localAudio") as HTMLAudioElement;
      if (localAudio) {
        localAudio.srcObject = stream;
      }

      peerConnection.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }

        if (visualizerRef.current) {
          if (visualizerCleanupRef.current) {
            visualizerCleanupRef.current();
          }
          const cleanup = createAudioVisualizer(event.streams[0], visualizerRef.current);
          visualizerCleanupRef.current = cleanup;
        }
      };

      stream.getTracks().forEach((track) =>
        peerConnection.addTransceiver(track, {
          direction: "sendrecv",
        })
      );

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const response = await fetch('/sdp', {
        method: 'POST',
        body: offer.sdp,
        headers: {
          "Content-Type": "application/sdp",
        },
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const sdp = await response.text();
      await peerConnection.setRemoteDescription({
        sdp,
        type: "answer",
      });
    } catch (error) {
      console.error('Error:', error);
      setIsSessionActive(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (visualizerCleanupRef.current) {
        visualizerCleanupRef.current();
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-900 via-blue-950 to-sky-900">
      {/* Update the overlay to be more subtle and icy */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
      
      {/* Animated snow effect */}
      <div className="pointer-events-none absolute inset-0 animate-snow" />
      
      <main className="relative mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-8">
          {/* Header section */}
          <header className="text-center">
            <div className="relative mb-6 inline-block">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-5xl backdrop-blur-md">
                🎅
              </div>
              <div className="absolute -right-2 -top-2 animate-bounce-slow">
                <span className="text-4xl">✨</span>
              </div>
            </div>
            
            <h1 className="mb-4 font-display text-6xl font-bold tracking-wide text-white drop-shadow-glow">
              Talk to Santa!
            </h1>
            <p className="font-serif text-xl italic text-white/90">
              Experience the magic of a personal chat with Santa Claus himself
            </p>
          </header>

          {!isSessionActive ? (
            <div className="rounded-xl bg-white/10 p-8 backdrop-blur-md transition-transform hover:scale-[1.02]">
              <button
                onClick={startSession}
                className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-red-600 to-red-700 px-8 py-4 text-xl font-bold text-white shadow-xl transition-all hover:from-red-500 hover:to-red-600 hover:shadow-2xl disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <span>Start Your Magical Chat</span>
                  <span className="text-2xl">🎅</span>
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform group-hover:translate-x-full" />
              </button>
            </div>
          ) : (
            <div className="rounded-xl bg-white/10 p-8 backdrop-blur-md">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="font-display text-3xl font-bold text-white drop-shadow-glow">
                    🎄 Santa is Listening... 🎄
                  </h2>
                </div>
                
                {/* Add back the audio elements */}
                <audio
                  id="localAudio"
                  autoPlay
                  muted
                  className="hidden"
                />
                
                <audio
                  ref={remoteAudioRef}
                  id="remoteAudio"
                  autoPlay
                  className="h-0 w-0 opacity-0 pointer-events-none"
                />
                
                {/* Enhanced visualizer */}
                <div className="overflow-hidden rounded-xl border border-white/20 bg-black/40 p-4 shadow-inner">
                  <canvas 
                    ref={visualizerRef}
                    width="800"
                    height="200"
                    className="w-full"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add footer */}
        <footer className="mt-12 text-center text-sm text-white/60">
          Made with ❤️ in NYC. Powered by{" "}
          <a 
            href="https://workers.cloudflare.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-white/90 transition-colors"
          >
            Cloudflare Workers
          </a>
          {", "}
          <a 
            href="https://developers.cloudflare.com/calls/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-white/90 transition-colors"
          >
            Cloudflare Calls
          </a>
          {" "}and{" "}
          <a 
            href="https://openai.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-white/90 transition-colors"
          >
            OpenAI
          </a>
        </footer>
      </main>

      {/* Decorative elements */}
      <div className="pointer-events-none absolute -left-20 bottom-0 text-8xl opacity-50 animate-float-slow">
        🎄
      </div>
      <div className="pointer-events-none absolute -right-16 top-0 text-8xl opacity-50 animate-float-delayed">
        🍬
      </div>

      {/* Add some floating snowflakes */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute animate-snow text-white opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              fontSize: `${Math.random() * 20 + 10}px`
            }}
          >
            ❄️
          </div>
        ))}
      </div>
    </div>
  );
}
