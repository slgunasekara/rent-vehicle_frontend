import {useEffect} from 'react';
import {useLang} from './index';
import si from './si';
import ta from './ta';

const DICT = {si, ta} as const;
const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'] as const;


export default function AutoTranslate() {
    const {lang} = useLang();

    useEffect(() => {
        const originalText = new Map<Text, { en: string; shown: string }>();
        const originalAttr = new Map<Element, Record<string, { en: string; shown: string }>>();
        const dict = lang === 'en' ? null : DICT[lang];
        let busy = false;

        const fix = (raw: string): string | null => {
            if (!dict) return null;
            const key = raw.trim();
            if (!key) return null;
            const hit = dict[key];
            if (!hit) return null;
            return raw.replace(key, hit);
        };

        const doText = (n: Text) => {
            if (n.parentElement?.closest('[data-no-translate]')) return;
            const rec = originalText.get(n);
            const cur = n.nodeValue ?? '';
            if (rec && cur === rec.shown) return; // still showing our translation
            const out = fix(cur);
            if (out !== null && out !== cur) {
                originalText.set(n, {en: cur, shown: out});
                n.nodeValue = out;
            } else if (rec) originalText.delete(n); // React wrote something new
        };
        const doEl = (el: Element) => {
            if (['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'svg'].includes(el.tagName)) return;
            for (const a of ATTRS) {
                const v = el.getAttribute(a);
                if (v === null) continue;
                const saved = originalAttr.get(el)?.[a];
                if (saved && v === saved.shown) continue;
                const out = fix(v);
                if (out !== null && out !== v) {
                    const rec = originalAttr.get(el) ?? {};
                    rec[a] = {en: v, shown: out};
                    originalAttr.set(el, rec);
                    el.setAttribute(a, out);
                }
            }
        };
        const walk = (root: Node) => {
            if (root.nodeType === Node.TEXT_NODE) {
                doText(root as Text);
                return;
            }
            if (root.nodeType !== Node.ELEMENT_NODE) return;
            const el = root as Element;
            if (el.closest('[data-no-translate]')) return;
            doEl(el);
            const tw = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
            let n = tw.nextNode();
            while (n) {
                if (n.nodeType === Node.TEXT_NODE) {
                    const p = n.parentElement;
                    if (p && !['SCRIPT', 'STYLE', 'TEXTAREA'].includes(p.tagName) && !p.closest('[data-no-translate]')) doText(n as Text);
                } else if (!(n as Element).closest('[data-no-translate]')) doEl(n as Element);
                n = tw.nextNode();
            }
        };
        const restore = () => {
            for (const [n, r] of originalText) if (n.isConnected && n.nodeValue === r.shown) n.nodeValue = r.en;
            for (const [el, rec] of originalAttr) for (const [a, r] of Object.entries(rec)) if (el.isConnected && el.getAttribute(a) === r.shown) el.setAttribute(a, r.en);
            originalText.clear();
            originalAttr.clear();
        };

        if (!dict) return;
        walk(document.body);
        const mo = new MutationObserver((list) => {
            if (busy) return;
            busy = true;
            try {
                for (const m of list) {
                    if (m.type === 'characterData') doText(m.target as Text);
                    else if (m.type === 'attributes') doEl(m.target as Element);
                    else m.addedNodes.forEach(walk);
                }
            } finally {
                setTimeout(() => {
                    busy = false;
                }, 0);
                mo.takeRecords();
            }
        });
        mo.observe(document.body, {
            subtree: true,
            childList: true,
            characterData: true,
            attributes: true,
            attributeFilter: [...ATTRS]
        });
        return () => {
            mo.disconnect();
            restore();
        };
    }, [lang]);

    return null;
}
