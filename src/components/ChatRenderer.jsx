import React, { useEffect, useRef, useState } from "react";

/*
Script format:
{
  theme: "whatsapp" | "imessage" | "snapchat",
  size: { width: 720, height: 1280 },
  messages: [
    { from: "me"|"them", text: "Hello", delay: 600 } // delay: ms after previous message before it arrives/starts typing
  ],
  fps: 30,
  durationPaddingMs: 800
}
*/

function Bubble({ from, text, theme }) {
  const cls = `bubble ${from === "me" ? "me" : "them"} ${theme}`;
  return <div className={cls}>{text}</div>;
}

export default function ChatRenderer({ script = {}, preview = false }) {
  const containerRef = useRef(null);
  const [rendered, setRendered] = useState([]);
  const scriptRef = useRef(script);

  useEffect(() => { scriptRef.current = script; setRendered([]); }, [script]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const { messages = [], size = { width: 720, height: 1280 }, fps = 30 } = scriptRef.current;
      // reset scroll
      const cont = containerRef.current;
      if (!cont) return;
      cont.style.width = (size.width || 720) + "px";
      cont.style.height = (size.height || 1280) + "px";
      setRendered([]);
      // play messages sequentially
      for (let i = 0; i < messages.length && !cancelled; i++) {
        const msg = messages[i];
        const delay = msg.delay ?? 800;
        // wait delay
        await new Promise(r => setTimeout(r, delay));
        if (cancelled) break;

        // typing simulation (progressive text)
        const full = msg.text || "";
        const parts = Math.max(6, Math.min(full.length, 30));
        let current = "";
        for (let k = 0; k <= full.length && !cancelled; k++) {
          current = full.slice(0, k);
          const copy = [...rendered.slice(0, rendered.length - 0)];
          // show as a full bubble once finished
          setRendered(prev => [...prev.filter((_, idx) => idx < prev.length), { from: msg.from, text: k === full.length ? full : current + (k < full.length ? "▌" : ""), theme: scriptRef.current.theme }]);
          await new Promise(r => setTimeout(r, 20 + (Math.random() * 40)));
        }
        // small pause after message
        await new Promise(r => setTimeout(r, 220));
        // ensure finished text is set
        setRendered(prev => {
          const copy = prev.slice(0, prev.length - 0).filter(Boolean);
          // replace last (we added sequentially)
          return [...copy.slice(0, copy.length - 0), { from: msg.from, text: full, theme: scriptRef.current.theme }];
        });
        // scroll
        cont.scrollTop = cont.scrollHeight;
      }

      // after playback, small padding for recording
      await new Promise(r => setTimeout(r, scriptRef.current.durationPaddingMs ?? 800));

      // If a recording automation flag exists, trigger it
      if (window.__auto_record && typeof window.__sendRecordingDone === "function") {
        // wait small moment, then notify page that it's done (page-side recorder should upload blob automatically)
        window.__sendRecordingDone();
      }
    };
    run();
    return () => { cancelled = true; };
  }, [script, preview /* re-run when preview toggles */]);

  return (
    <div className={`chat-canvas ${script.theme || "whatsapp"}`} style={{ width: 360, height: 640, overflow: "hidden" }}>
      <div className="chat-topbar">{(script.theme || "whatsapp").toUpperCase()}</div>
      <div className="chat-area" ref={containerRef}>
        {rendered.map((m, i) => <Bubble key={i} from={m.from} text={m.text} theme={script.theme} />)}
      </div>
    </div>
  );
}
