function e(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}function t(e){return e?e.replace(/\s*\(1\s*kg\s*custom[^)]*\)/gi,``).trim():``}function n(n,i={}){let a=(i.paper_width||`80mm`)===`80mm`||i.custom_paper_width_mm&&i.custom_paper_width_mm>=75,o=a?`11px`:`9.5px`,s=a?`14px`:`12px`,c=a?`14px`:`12px`,l=i.font_family||`sans-serif`,u=`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Plus Jakarta Sans', Helvetica, Arial, sans-serif`;l===`consolas`||l===`monospace`?u=`'Consolas', 'Courier New', monospace`:l===`courier`?u=`'Courier New', Courier, monospace`:l===`roboto-mono`&&(u=`'Roboto Mono', monospace`);let d=n.items.map(n=>{let i=n.variant_label?` (${e(t(n.variant_label))})`:``;return`
            <tr>
                <td colspan="2" style="font-weight: 700; padding-top: 4px; font-size: ${o}; color: #000; line-height: 1.3;">
                    ${e(n.product_name)}${i}
                </td>
            </tr>
            <tr>
                <td style="text-align: left; padding-left: 4px; padding-bottom: 4px; font-size: ${o}; color: #222;">
                    ${n.quantity} x Rp ${r(n.price)}
                </td>
                <td style="text-align: right; font-weight: 700; padding-bottom: 4px; white-space: nowrap; font-size: ${o}; color: #000; font-variant-numeric: tabular-nums;">
                    Rp ${r(n.subtotal)}
                </td>
            </tr>
        `}).join(``);return`
    <div class="sanubari-receipt-body" style="width: 100%; box-sizing: border-box; color: #000000; font-family: ${u}; font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 8px;">
            ${i.show_logo===!1?``:`<div style="font-weight: 900; font-size: ${s}; letter-spacing: 1px; text-transform: uppercase;">ALAT KOPI MALANG</div>`}
            <div style="font-size: ${s}; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">
                ${e(n.store_name||`Alat Kopi Malang`)}
            </div>
            ${n.tagline?`<div style="font-size: 10px; font-style: italic; color: #333; margin-top: 1px;">${e(n.tagline)}</div>`:``}
            ${n.address?`<div style="font-size: 9.5px; line-height: 1.3; color: #333; margin-top: 2px;">${e(n.address)}</div>`:``}
            ${n.phone?`<div style="font-size: 9.5px; color: #333;">WA: ${e(n.phone)}</div>`:``}
        </div>

        <div style="border-bottom: 1.5px dashed #000000; margin: 6px 0;"></div>

        <!-- Refund Notice -->
        ${n.is_refund?`
            <div style="text-align: center; font-weight: 900; font-size: ${o}; margin: 4px 0;">
                *** BUKTI REFUND / RETUR ***<br>
                <span style="font-size: 9.5px;">Alasan: ${e(n.refund_reason||`Pengembalian Kasir`)}</span>
            </div>
            <div style="border-bottom: 1px dashed #000000; margin: 4px 0;"></div>
        `:``}

        <!-- Order Meta -->
        <table style="width: 100%; font-size: 10px; border-collapse: collapse; margin-bottom: 4px; color: #000; font-variant-numeric: tabular-nums;">
            <tr>
                <td style="text-align: left; font-weight: 800;">No: #${e(n.order_number)}</td>
                <td style="text-align: right; white-space: nowrap; font-weight: 500;">${e(n.date)}</td>
            </tr>
            <tr>
                <td style="text-align: left;">Kasir: ${e(n.cashier_name)}</td>
                <td style="text-align: right; white-space: nowrap;">
                    ${n.customer_name&&n.customer_name!==`Pelanggan Kasir`?e(n.customer_name):``}
                </td>
            </tr>
            ${n.customer_address&&n.customer_address!==`Toko Fisik / POS Kasir`?`
            <tr>
                <td colspan="2" style="text-align: left; font-size: 9px; padding-top: 2px;">
                    Alamat: ${e(n.customer_address)}
                </td>
            </tr>
            `:``}
        </table>

        <div style="border-bottom: 1px dashed #000000; margin: 6px 0;"></div>

        <!-- Items -->
        <table style="width: 100%; border-collapse: collapse; color: #000;">
            ${d}
        </table>

        <div style="border-bottom: 1px dashed #000000; margin: 6px 0;"></div>

        <!-- Totals -->
        <table style="width: 100%; font-size: ${o}; border-collapse: collapse; color: #000; font-variant-numeric: tabular-nums;">
            <tr>
                <td style="text-align: left; padding: 2px 0;">Subtotal</td>
                <td style="text-align: right; white-space: nowrap; font-weight: 700;">Rp ${r(n.subtotal)}</td>
            </tr>
            ${n.discount_amount>0?`
            <tr>
                <td style="text-align: left; padding: 2px 0; font-weight: 700;">Diskon</td>
                <td style="text-align: right; font-weight: 700; white-space: nowrap;">-Rp ${r(n.discount_amount)}</td>
            </tr>
            `:``}
            ${n.shipping_cost&&n.shipping_cost>0?`
            <tr>
                <td style="text-align: left; padding: 2px 0;">Ongkir (${e(n.shipping_courier||`Kurir`)})</td>
                <td style="text-align: right; white-space: nowrap;">Rp ${r(n.shipping_cost)}</td>
            </tr>
            `:``}
            <tr style="border-top: 1.5px dashed #000000;">
                <td style="text-align: left; font-weight: 900; font-size: ${c}; padding: 5px 0;">TOTAL</td>
                <td style="text-align: right; font-weight: 900; font-size: ${c}; padding: 5px 0; white-space: nowrap;">
                    Rp ${r(n.total_amount)}
                </td>
            </tr>
            <tr>
                <td style="text-align: left; padding: 2px 0;">Metode Bayar</td>
                <td style="text-align: right; font-weight: 700; text-transform: uppercase;">
                    ${e(n.payment_method_label)}
                </td>
            </tr>
            ${n.cash_tendered&&n.cash_tendered>0?`
            <tr>
                <td style="text-align: left; padding: 2px 0;">Tunai Diterima</td>
                <td style="text-align: right; white-space: nowrap;">Rp ${r(n.cash_tendered)}</td>
            </tr>
            <tr>
                <td style="text-align: left; padding: 2px 0; font-weight: 700;">Kembalian</td>
                <td style="text-align: right; font-weight: 700; white-space: nowrap;">Rp ${r(n.cash_change||0)}</td>
            </tr>
            `:``}
        </table>

        <div style="border-bottom: 1.5px dashed #000000; margin: 6px 0;"></div>

        <!-- Footer -->
        <div style="text-align: center; font-size: 9.5px; margin-top: 8px; line-height: 1.4; color: #000;">
            ${n.footer_note?n.footer_note.split(`
`).map(t=>`<div>${e(t)}</div>`).join(``):`<div>Terima kasih atas pesanannya</div>`}
            ${n.instagram?`<div style="margin-top: 3px; font-weight: 800; letter-spacing: 0.2px;">IG: ${e(n.instagram)}</div>`:``}
        </div>
    </div>
    `}function r(e){let t=typeof e==`number`&&!isNaN(e)?e:0;return new Intl.NumberFormat(`id-ID`).format(t)}function i(e,t){if(e.length>=t)return e.substring(0,t);let n=Math.floor((t-e.length)/2),r=t-e.length-n;return` `.repeat(n)+e+` `.repeat(r)}function a(e,t,n){let r=Math.max(1,n-e.length-t.length);return e+` `.repeat(r)+t}function o(e,n=`58mm`){let o=typeof n==`string`?{paper_width:n}:n||{},s=o.paper_width||`58mm`,c=s===`custom`,l=Number(o.receipt_columns)||(c?Number(o.custom_receipt_columns)||40:s===`80mm`?Number(o.receipt_columns_80mm)||44:Number(o.receipt_columns_58mm)||32),u=Number(o.max_item_name_length)||(l>=44?Math.min(l-12,34):l>=38?26:Math.min(l-10,22)),d=o.show_logo??!0,f=Number(o.margin_feed_lines)??2,p=`-`.repeat(l),m=`=`.repeat(l),h=[];d&&h.push(i(`*** ALAT KOPI MALANG ***`,l)),h.push(i(e.store_name.toUpperCase(),l)),e.tagline&&h.push(i(e.tagline,l)),e.address&&h.push(i(e.address,l)),e.phone&&h.push(i(`WA: ${e.phone}`,l)),h.push(m),e.is_refund&&(h.push(i(`*** BUKTI REFUND / RETUR ***`,l)),h.push(i(`DANA TELAH DIKEMBALIKAN`,l)),e.refund_reason&&h.push(a(`Alasan: ${e.refund_reason}`,``,l)),h.push(m)),h.push(a(`No: #${e.order_number}`,``,l)),h.push(a(`Tgl: ${e.date}`,`Kasir: ${e.cashier_name}`,l)),e.customer_name&&e.customer_name!==`Pelanggan Kasir`&&h.push(a(`Pelanggan: ${e.customer_name}`,``,l)),e.customer_phone&&e.customer_phone!==`-`&&h.push(a(`Telp/WA: ${e.customer_phone}`,``,l)),e.customer_address&&e.customer_address!==`Toko Fisik / POS Kasir`&&h.push(`Alamat: ${e.customer_address}`),h.push(p);for(let n of e.items){let e=`${n.product_name} (${t(n.variant_label)})`,i=Math.min(u,l);if(e.length<=i)h.push(e);else{let t=e;for(;t.length>0;){if(t.length<=i){h.push(t);break}let e=t.lastIndexOf(` `,i);e<=0&&(e=i),h.push(t.substring(0,e)),t=t.substring(e).trim()}}let o=`  ${n.quantity}x ${r(n.price)}`,s=r(n.subtotal);h.push(a(o,s,l))}if(h.push(p),h.push(a(`Subtotal`,`Rp ${r(e.subtotal)}`,l)),e.discount_amount>0&&h.push(a(`Diskon`,`-Rp ${r(e.discount_amount)}`,l)),e.shipping_cost&&e.shipping_cost>0){let t=e.shipping_courier?` (${e.shipping_courier})`:``;h.push(a(`Ongkir${t}`,`Rp ${r(e.shipping_cost)}`,l))}h.push(a(`TOTAL`,`Rp ${r(e.total_amount)}`,l)),h.push(p),e.is_refund&&(h.push(a(`TOTAL REFUND`,`Rp ${r(e.refund_amount||e.total_amount)}`,l)),h.push(a(`Status Kasir`,`SUDAH DI-REFUND`,l)),h.push(p)),h.push(a(`Metode Bayar`,e.payment_method_label,l)),e.cash_tendered&&e.cash_tendered>0&&(h.push(a(`Bayar Tunai`,`Rp ${r(e.cash_tendered)}`,l)),h.push(a(`Kembalian`,`Rp ${r(e.cash_change||0)}`,l))),h.push(m),e.footer_note&&e.footer_note.split(`
`).forEach(e=>h.push(i(e,l))),e.instagram&&h.push(i(`IG: ${e.instagram}`,l));for(let e=0;e<f;e++)h.push(``);return h.join(`
`)}function s(e,t=!1,n=`58mm`){let r=new TextEncoder().encode(e+`


`),i=new Uint8Array([27,64]),a=t?new Uint8Array([27,112,0,25,250]):new Uint8Array([]),o=n===`80mm`?new Uint8Array([29,86,0]):new Uint8Array([]),s=new Uint8Array(i.length+a.length+r.length+o.length),c=0;return s.set(i,c),c+=i.length,a.length>0&&(s.set(a,c),c+=a.length),s.set(r,c),c+=r.length,o.length>0&&(s.set(o,c),c+=o.length),s}function c(e,t,n=1,r=!1,i=`58mm`,a){if(typeof window>`u`||typeof document>`u`)return;let o=window.electronAPI;if(o&&typeof o.printReceipt==`function`){(async()=>{let n=`sanubari-pos-direct-print-root`,r=`sanubari-pos-direct-print-style`,s=document.getElementById(n);s&&s.parentNode&&s.parentNode.removeChild(s);let c=document.getElementById(r);c&&c.parentNode&&c.parentNode.removeChild(c);let l=i===`custom`||a?.paper_width===`custom`,u=Math.max(30,Math.min(120,Number(a?.custom_paper_width_mm)||58)),d=Math.max(20,Math.min(u,Number(a?.custom_printable_width_mm)||u-4)),f=l?`${d}mm`:i===`80mm`?a?.custom_printable_width_mm?`${a.custom_printable_width_mm}mm`:`72mm`:`48mm`,p=l?`${u}mm auto`:i===`80mm`?`80mm auto`:`58mm auto`,m=i===`80mm`||l&&u>=75?`12px`:`10.5px`,h=a?.font_family||`sans-serif`,g=`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Plus Jakarta Sans', sans-serif`;h===`courier`?g=`'Courier New', Courier, monospace`:h===`consolas`||h===`monospace`?g=`'Consolas', 'Courier New', monospace`:h===`roboto-mono`&&(g=`'Roboto Mono', monospace`);let _=document.createElement(`style`);_.id=r,_.textContent=`
                @media screen {
                    #${n} {
                        display: none !important;
                    }
                }
                @media print {
                    @page {
                        size: ${p};
                        margin: 0 !important;
                    }
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        width: 100% !important;
                        height: auto !important;
                        min-height: 0 !important;
                        overflow: visible !important;
                    }
                    body > *:not(#${n}) {
                        display: none !important;
                    }
                    #${n} {
                        display: block !important;
                        position: static !important;
                        width: ${f} !important;
                        margin: 0 !important;
                        padding: 1mm !important;
                        box-sizing: border-box !important;
                        font-family: ${g} !important;
                        font-variant-numeric: tabular-nums !important;
                        font-size: ${m} !important;
                        line-height: 1.25 !important;
                        color: #000000 !important;
                        background: #ffffff !important;
                        visibility: visible !important;
                        -webkit-font-smoothing: antialiased !important;
                        -moz-osx-font-smoothing: grayscale !important;
                        text-rendering: geometricPrecision !important;
                    }
                        -moz-osx-font-smoothing: grayscale !important;
                        text-rendering: geometricPrecision !important;
                    }
                    #${n} pre {
                        margin: 0 !important;
                        white-space: pre !important;
                        overflow: hidden !important;
                        word-break: normal !important;
                        font-family: inherit !important;
                        font-size: inherit !important;
                        color: #000000 !important;
                    }
                    #${n} table {
                        border-collapse: collapse !important;
                        color: #000000 !important;
                    }
                }
            `,document.head.appendChild(_);let v=e.match(/<body[^>]*>([\s\S]*?)<\/body>/i),y=v?v[1]:`<pre>${(t||``).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</pre>`,b=document.createElement(`div`);b.id=n,b.innerHTML=y,document.body.appendChild(b);try{let e=a?.printer_name||a?.usb_printer_name||``;if(typeof o.getPrinters==`function`)try{let t=await o.getPrinters();if(Array.isArray(t)&&t.length>0){if(e){let n=t.find(t=>t.name&&t.name.toLowerCase()===e.toLowerCase()||t.displayName&&t.displayName.toLowerCase()===e.toLowerCase());n&&(e=n.name)}if(!e){let n=t.find(e=>e.isDefault),r=t.find(e=>/pos80|pos58|pos-|thermal|receipt|tm-t|tm-u|xprinter|eppos|vsc|blueprint|panda|iware|codesoft|rpp|mtp/i.test(`${e.name||``} ${e.displayName||``}`)),i=e=>/microsoft print to pdf|xps document writer|onenote|fax/i.test(e||``),a=t.find(e=>!i(e.name));n&&!i(n.name)?e=n.name:r?e=r.name:a?e=a.name:n&&(e=n.name)}}}catch{}await new Promise(e=>requestAnimationFrame(()=>setTimeout(e,30)));let t=l?u*1e3:i===`80mm`?8e4:58e3,n=await o.printReceipt({silent:!0,printerName:e,pageSize:{width:t,height:2e5}});(!n||!n.success)&&(n=await o.printReceipt({silent:!0,printerName:e,pageSize:`A4`})),(!n||!n.success)&&e!==``&&await o.printReceipt({silent:!0,printerName:``,pageSize:`A4`})}finally{b.parentNode&&b.parentNode.removeChild(b),_.parentNode&&_.parentNode.removeChild(_)}})();return}if(E()&&t){let e=O();if(e&&e.address)try{let a=T(s(t,r,i));window.SanubariAndroidBluetooth.printEscPosBase64(a,e.address,Math.max(1,n));return}catch{}}let c=`sanubari-pos-silent-print-frame`,l=document.getElementById(c);l&&l.parentNode&&l.parentNode.removeChild(l);let u=document.createElement(`iframe`);u.id=c,u.setAttribute(`aria-hidden`,`true`),u.style.position=`fixed`,u.style.right=`0`,u.style.bottom=`0`,u.style.width=`0`,u.style.height=`0`,u.style.border=`0`,u.style.opacity=`0`,u.style.pointerEvents=`none`,u.style.zIndex=`-1`,document.body.appendChild(u);let d=u.contentWindow,f=u.contentDocument||d?.document;if(!f||!d)return;let p=!1,m=()=>{if(!p){p=!0;try{d.focus(),d.print()}catch{}window.setTimeout(()=>{u.parentNode&&u.parentNode.removeChild(u)},3e4)}};u.onload=m,f.open(),f.write(e),f.close(),window.setTimeout(m,80)}function l(e,t=`58mm`){let r=typeof t==`string`?{paper_width:t}:t||{},i=r.paper_width||`58mm`,a=i===`custom`,s=Math.max(30,Math.min(120,Number(r.custom_paper_width_mm)||58)),l=Math.max(20,Math.min(s,Number(r.custom_printable_width_mm)||s-4)),u=r.margin_horizontal||`2mm`,d=Math.max(1,Number(r.copies)||1),f=o(e,r),p=a?`${l}mm`:i===`80mm`?r.custom_printable_width_mm?`${r.custom_printable_width_mm}mm`:`72mm`:`48mm`,m=a?`${s}mm auto`:i===`80mm`?`80mm auto`:`58mm auto`,h=r.font_family||`sans-serif`,g=`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Plus Jakarta Sans', Helvetica, Arial, sans-serif`;h===`courier`?g=`'Courier New', Courier, monospace`:h===`consolas`||h===`monospace`?g=`'Consolas', 'Lucida Console', 'Courier New', monospace`:h===`roboto-mono`&&(g=`'Roboto Mono', monospace, 'Courier New'`);let _=r.font_size||`normal`,v=i===`80mm`||a&&s>=75?`12px`:`10.5px`;_===`compact`?v=i===`80mm`||a&&s>=75?`10.5px`:`9.5px`:_===`large`&&(v=i===`80mm`||a&&s>=75?`14px`:`12px`);let y=(r.font_weight||`normal`)===`bold`?`bold`:`normal`,b=r.formatting===`plain`?`<pre>${f.replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</pre>`:n(e,r),x=[`SALINAN PELANGGAN`,`SALINAN KASIR / TOKO`,`SALINAN BAR / DAPUR`],S=``;for(let e=0;e<d;e++){let t=d>1?`<div style="text-align:center;font-weight:bold;font-size:10px;padding:3px 0;margin-bottom:4px;border-bottom:1px dashed #000;">[ ${x[e]||`SALINAN #${e+1}`} ]</div>`:``,n=e<d-1?`<div style="text-align:center;font-size:10px;margin:12px 0;border-top:1px dashed #000;padding-top:4px;color:#000;">- - - - - POTONG DI SINI - - - - -</div>`:``;S+=`<div class="receipt-copy">${t}${b}</div>${n}`}c(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Struk #${e.order_number}</title>
    <style>
        @page {
            size: ${m};
            margin: 0;
        }
        body {
            margin: 0 auto;
            padding: 2mm ${u};
            width: ${p};
            box-sizing: border-box;
            font-family: ${g};
            font-size: ${v};
            font-weight: ${y};
            line-height: 1.25;
            color: #000000;
            background: #ffffff;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-variant-numeric: tabular-nums;
            text-rendering: geometricPrecision;
        }
        pre {
            margin: 0;
            white-space: pre !important;
            overflow: hidden !important;
            word-break: normal !important;
            font-family: inherit;
            font-size: inherit;
            font-weight: inherit;
            color: #000000;
        }
        table {
            border-collapse: collapse;
            color: #000000;
        }
        @media print {
            body {
                width: 100%;
                padding: 0 ${u};
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    ${S}
</body>
</html>
    `,f,d,!!r.open_cash_drawer,i,r)}function u(e,t=`58mm`){let n=typeof t==`string`?{paper_width:t}:t||{},r=o(e,n),i=new TextEncoder().encode(r+`


`),a=new Uint8Array([27,64]),s=n.font_size===`compact`?new Uint8Array([27,77,1]):new Uint8Array([27,77,0]),c=n.font_weight===`bold`?new Uint8Array([27,69,1]):new Uint8Array([27,69,0]),l=n.open_cash_drawer?new Uint8Array([27,112,0,25,250]):new Uint8Array([]),u=(n.paper_width||`58mm`)===`80mm`,d=n.paper_width===`custom`,f=Number(n.custom_paper_width_mm)||58,p=u||d&&f>=75?new Uint8Array([29,86,0]):new Uint8Array([]),m=a.length+s.length+c.length+l.length+i.length+p.length,h=new Uint8Array(m),g=0;return h.set(a,g),g+=a.length,h.set(s,g),g+=s.length,h.set(c,g),g+=c.length,l.length>0&&(h.set(l,g),g+=l.length),h.set(i,g),g+=i.length,p.length>0&&(h.set(p,g),g+=p.length),h}var d=`sanubari_pos_usb_printer_v1`,f=null,p=null;function m(){return typeof window<`u`&&!!window.electronAPI?.isDesktop}async function h(){if(typeof window>`u`)return[];let e=window.electronAPI;if(e&&typeof e.getPrinters==`function`)try{let t=await e.getPrinters();if(Array.isArray(t))return t.map(e=>({name:e.name||``,displayName:e.displayName||e.name||``,isDefault:!!e.isDefault,description:e.description||``,status:e.status}))}catch(e){console.warn(`Failed to get printers from electronAPI:`,e)}return[]}function g(){return typeof navigator<`u`&&`usb`in navigator&&typeof navigator.usb?.requestDevice==`function`}function _(){if(typeof window>`u`)return null;try{let e=localStorage.getItem(d);return e?JSON.parse(e):null}catch{return null}}function v(e){if(!(typeof window>`u`))try{e?localStorage.setItem(d,JSON.stringify(e)):localStorage.removeItem(d)}catch{}}async function y(){if(!g())return!1;try{let e=_();if(!e)return!1;let t=(await navigator.usb.getDevices()).find(t=>t.vendorId===e.vendorId&&t.productId===e.productId);if(!t)return!1;await t.open(),t.configuration===null&&await t.selectConfiguration(1);let n=null,r=null;if(t.configuration&&Array.isArray(t.configuration.interfaces))for(let e of t.configuration.interfaces){for(let t of e.alternates||[]){for(let i of t.endpoints||[])if(i.direction===`out`&&(i.type===`bulk`||i.type===`interrupt`)){n=e.interfaceNumber,r=i.endpointNumber;break}if(r!==null)break}if(r!==null)break}if(n!==null)try{await t.claimInterface(n)}catch{}return f=t,p=r,!0}catch{return!1}}async function b(){if(!g())throw Error(`Browser ini tidak mendukung WebUSB. Silakan gunakan Google Chrome atau Microsoft Edge di Windows.`);let e=await navigator.usb.requestDevice({filters:[]});if(!e)return null;await e.open(),e.configuration===null&&await e.selectConfiguration(1);let t=null,n=null;if(e.configuration&&Array.isArray(e.configuration.interfaces))for(let r of e.configuration.interfaces){for(let e of r.alternates||[]){for(let i of e.endpoints||[])if(i.direction===`out`&&(i.type===`bulk`||i.type===`interrupt`)){t=r.interfaceNumber,n=i.endpointNumber;break}if(n!==null)break}if(n!==null)break}if(t!==null)try{await e.claimInterface(t)}catch{}f=e,p=n;let r=`0x`+e.vendorId.toString(16).padStart(4,`0`).toUpperCase(),i=`0x`+e.productId.toString(16).padStart(4,`0`).toUpperCase(),a={name:e.productName||`Thermal USB Printer (${r}:${i})`,vendorId:e.vendorId,productId:e.productId,productName:e.productName||`Thermal POS Printer`,manufacturerName:e.manufacturerName,serialNumber:e.serialNumber,connected:!0};return v(a),a}async function x(e,t=`58mm`){let n=u(e,typeof t==`string`?{paper_width:t}:t||{});if((!f||!f.opened)&&!await y()&&!await b())return!1;if(!f)throw Error(`Printer USB tidak terhubung.`);let r=p??1;return await f.transferOut(r,n),!0}var S=`sanubari_pos_bt_printer_v1`,C=null,w=null;function T(e){let t=``,n=e.byteLength;for(let r=0;r<n;r++)t+=String.fromCharCode(e[r]);return typeof window<`u`?window.btoa(t):``}function E(){if(typeof window>`u`)return!1;let e=window.SanubariAndroidBluetooth;try{return!!(e&&typeof e.isNativeAvailable==`function`&&e.isNativeAvailable())}catch{return!!e}}function D(){return typeof navigator>`u`?!1:!!navigator.bluetooth}function O(){if(typeof window>`u`)return null;if(E())try{let e=window.SanubariAndroidBluetooth.getStatus(),t=JSON.parse(e);if(t&&t.savedAddress)return{name:t.savedName||`Printer (${t.savedAddress})`,address:t.savedAddress,bonded:!0,isPrinter:!0,connected:!0,source:`android-native`}}catch{}if(C&&w)return{name:C.name||`Printer Bluetooth (Web)`,address:C.id||`WEB-BT`,bonded:!0,isPrinter:!0,connected:!!C.gatt?.connected,source:`web-bluetooth`};try{let e=window.localStorage.getItem(S);if(e)return JSON.parse(e)}catch{}return null}function k(e){if(!(typeof window>`u`))try{e?window.localStorage.setItem(S,JSON.stringify(e)):window.localStorage.removeItem(S)}catch{}}function A(){if(!E())return[];try{let e=window.SanubariAndroidBluetooth.getDevices(),t=JSON.parse(e);return Array.isArray(t)?t.sort((e,t)=>e.connected&&!t.connected?-1:!e.connected&&t.connected?1:e.isPrinter&&!t.isPrinter?-1:!e.isPrinter&&t.isPrinter?1:e.bonded&&!t.bonded?-1:!e.bonded&&t.bonded?1:(e.name||``).localeCompare(t.name||``)):[]}catch{return[]}}function j(){if(!E())return!1;try{return window.SanubariAndroidBluetooth.startScan(),!0}catch{return!1}}function M(){if(E())try{window.SanubariAndroidBluetooth.stopScan()}catch{}}function N(){if(E())try{window.SanubariAndroidBluetooth.openBluetoothSettings();return}catch{}if(typeof window<`u`)try{window.location.href=`intent:#Intent;action=android.settings.BLUETOOTH_SETTINGS;end`}catch{}}function P(e){return new Promise(t=>{if(!E()){t({success:!1,message:`Jembatan Bluetooth Native Android tidak tersedia.`});return}let n=!1,r=window.setTimeout(()=>{n||(n=!0,window.removeEventListener(`sanubari-bt-connect-result`,i),t({success:!1,address:e,message:`Waktu koneksi habis (timeout). Pastikan printer Bluetooth menyala dan berada di dekat perangkat.`}))},16e3),i=a=>{if(n)return;let o=a.detail||{};o.disconnected||(n=!0,window.clearTimeout(r),window.removeEventListener(`sanubari-bt-connect-result`,i),o.success&&k({name:o.name||`Printer (${e})`,address:o.address||e,bonded:!0,isPrinter:!0,connected:!0,source:`android-native`}),t({success:!!o.success,name:o.name,address:o.address||e,message:o.message||(o.success?`Terhubung ke printer!`:`Gagal menghubungkan printer.`)}))};window.addEventListener(`sanubari-bt-connect-result`,i);try{window.SanubariAndroidBluetooth.connectDevice(e)}catch(a){n||(n=!0,window.clearTimeout(r),window.removeEventListener(`sanubari-bt-connect-result`,i),t({success:!1,address:e,message:a?.message||`Gagal memanggil koneksi Bluetooth Android.`}))}})}function F(){if(k(null),E())try{window.SanubariAndroidBluetooth.disconnectDevice()}catch{}if(C){try{C.gatt?.connected&&C.gatt.disconnect()}catch{}C=null,w=null}}async function I(){let e=navigator;if(!e.bluetooth)throw Error(`Web Bluetooth tidak tersedia di browser ini.`);try{let t=await e.bluetooth.requestDevice({acceptAllDevices:!0,optionalServices:[`000018f0-0000-1000-8000-00805f9b34fb`,`49535343-fe7d-4ae5-8fa9-9fafd205e455`,`0000e0ff-0000-1000-8000-00805f9b34fb`,`0000ff00-0000-1000-8000-00805f9b34fb`,`e7810a71-73ae-499d-8c15-faa9aef0c3f1`]});if(!t.gatt)throw Error(`Perangkat printer tidak mendukung koneksi GATT.`);let n=await(await t.gatt.connect()).getPrimaryServices(),r=null;for(let e of n){let t=await e.getCharacteristics();for(let e of t)if(e.properties.write||e.properties.writeWithoutResponse){r=e;break}if(r)break}if(!r)throw Error(`Tidak ditemukan karakteristik cetak pada perangkat Bluetooth ini.`);C=t,w=r;let i={name:t.name||`Printer Bluetooth`,address:t.id||`WEB-BT`,bonded:!0,isPrinter:!0,connected:!0,source:`web-bluetooth`};return k(i),i}catch(e){if(e?.name===`NotFoundError`)return null;throw e}}function L(e,t=`58mm`){return`rawbt:base64,${T(u(e,typeof t==`string`?{paper_width:t}:t||{}))}`}function R(e,t=`58mm`,n){return new Promise(r=>{if(!E()){r({success:!1,message:`Fitur Bluetooth Native Android belum aktif.`});return}let i=typeof t==`string`?{paper_width:t}:t||{},a=Math.max(1,Number(i.copies)||1),o=T(u(e,i)),s=O(),c=n||s?.address||``,l=!1,d=window.setTimeout(()=>{l||(l=!0,window.removeEventListener(`sanubari-bt-print-result`,f),r({success:!1,message:`Waktu cetak habis (timeout). Pastikan printer Bluetooth menyala dan kertas tersedia.`}))},2e4),f=e=>{if(l)return;l=!0,window.clearTimeout(d),window.removeEventListener(`sanubari-bt-print-result`,f);let t=e.detail||{};r({success:!!t.success,needSelectPrinter:!!t.needSelectPrinter,name:t.name,address:t.address,message:t.message||(t.success?`Struk berhasil dicetak!`:`Gagal mencetak struk.`)})};window.addEventListener(`sanubari-bt-print-result`,f);try{window.SanubariAndroidBluetooth.printEscPosBase64(o,c,a)}catch(e){l||(l=!0,window.clearTimeout(d),window.removeEventListener(`sanubari-bt-print-result`,f),r({success:!1,message:e?.message||`Gagal mengirim data cetak ke printer Bluetooth.`}))}})}async function z(e,t=`58mm`,n){if(E()){let r=await R(e,t,n);if(!r.success){let e=Error(r.message);throw e.needSelectPrinter=r.needSelectPrinter,e}return!0}if(!navigator.bluetooth){let e=Error(`Web Bluetooth tidak didukung di WebView ini. Gunakan fitur Pencarian Printer Bluetooth di aplikasi.`);throw e.code=`BT_UNSUPPORTED_WEBVIEW`,e}let r=typeof t==`string`?{paper_width:t}:t||{},i=Math.max(1,Number(r.copies)||1);try{let t=w;if(!t||!C?.gatt?.connected){if(!await I())return!1;t=w}if(!t)throw Error(`Tidak ditemukan karakteristik cetak pada printer Bluetooth ini.`);let n=u(e,r);for(let e=0;e<i;e++){for(let e=0;e<n.length;e+=100){let r=n.slice(e,e+100);t.properties.write?await t.writeValueWithResponse(r):await t.writeValueWithoutResponse(r),await new Promise(e=>setTimeout(e,20))}e<i-1&&await new Promise(e=>setTimeout(e,600))}return!0}catch(e){if(w=null,e.name===`NotFoundError`)return!1;throw e}}function B(e,n){let i=(n||e.customer_phone||``).replace(/[^0-9]/g,``);i.startsWith(`0`)&&(i=`62`+i.substring(1));let a=e.items.map((e,n)=>{let i=t(e.variant_label),a=i&&i!==`Default`&&i!==`Standar`?` (${i})`:``;return`${n+1}. *${e.product_name}*${a}\n   ${e.quantity}x @ Rp ${r(e.price)} = Rp ${r(e.subtotal)}`}).join(`

`),o=`*${e.store_name.toUpperCase()}*\n`;o+=`_${e.tagline||`Specialty Coffee Roastery`}_\n`,o+=`========================================
`,o+=`*STRUK PEMBELIAN*
`,o+=`========================================
`,o+=`No. Struk : #${e.order_number}\n`,o+=`Tanggal   : ${e.date}\n`,o+=`Kasir     : ${e.cashier_name}\n`,e.customer_name&&e.customer_name!==`Pelanggan Kasir`&&(o+=`Pelanggan : ${e.customer_name}\n`),e.customer_phone&&e.customer_phone!==`-`&&(o+=`Telepon   : ${e.customer_phone}\n`),e.customer_address&&e.customer_address!==`Toko Fisik / POS Kasir`&&(o+=`Alamat    : ${e.customer_address}\n`),e.shipping_courier&&(e.shipping_cost||0)>0&&(o+=`Ekspedisi : ${e.shipping_courier}\n`),o+=`----------------------------------------
`,o+=`*RINCIAN PESANAN:*

`,o+=`${a}\n`,o+=`----------------------------------------
`,o+=`Subtotal  : Rp ${r(e.subtotal)}\n`,e.discount_amount>0&&(o+=`Diskon    : -Rp ${r(e.discount_amount)}\n`),e.shipping_cost&&e.shipping_cost>0&&(o+=`Ongkir    : Rp ${r(e.shipping_cost)}\n`),o+=`*TOTAL    : Rp ${r(e.total_amount)}*\n`,o+=`Metode    : ${e.payment_method_label}\n`,e.cash_tendered&&e.cash_tendered>0&&(o+=`Tunai     : Rp ${r(e.cash_tendered)}\n`,o+=`Kembalian : Rp ${r(e.cash_change||0)}\n`),o+=`----------------------------------------
`,o+=`${e.footer_note||`Terima kasih telah berbelanja di Alat Kopi Malang!`}\n`,e.instagram&&(o+=`\nInstagram: https://instagram.com/${e.instagram.replace(`@`,``)}\n`);let s=encodeURIComponent(o);return i?`https://wa.me/${i}?text=${s}`:`https://wa.me/?text=${s}`}function V(e,t=`58mm`){let n=t===`80mm`?42:32,o=`-`.repeat(n),s=`=`.repeat(n),c=[];c.push(i(e.store_name.toUpperCase(),n)),c.push(i(`RINGKASAN PENJUALAN POS`,n)),c.push(s),c.push(a(`Periode:`,e.period_title,n)),c.push(a(`Dicetak:`,e.printed_at,n)),c.push(a(`Kasir:`,e.cashier_name,n)),c.push(o),c.push(a(`Total Transaksi`,`${e.total_transactions} Trx`,n)),c.push(a(`Total Omset`,`Rp ${r(e.total_revenue)}`,n)),c.push(a(`Rata-rata/Trx`,`Rp ${r(e.average_order_value)}`,n)),c.push(o),c.push(i(`METODE PEMBAYARAN`,n));for(let t of e.payment_breakdown)c.push(a(`${t.label} (${t.count})`,`Rp ${r(t.total)}`,n));if(c.push(o),e.cash_drawer&&(c.push(i(`ARUS KAS TUNAI LACI`,n)),c.push(a(`Penjualan Tunai`,`+Rp ${r(e.cash_drawer.cash_sales)}`,n)),c.push(a(`Kas Masuk Lain`,`+Rp ${r(e.cash_drawer.cash_in)}`,n)),c.push(a(`Kas Keluar Toko`,`-Rp ${r(e.cash_drawer.cash_out)}`,n)),c.push(a(`TOTAL KAS DI LACI`,`Rp ${r(e.cash_drawer.net_cash)}`,n)),c.push(o)),e.top_products&&e.top_products.length>0){c.push(i(`PRODUK TERLARIS`,n));for(let t of e.top_products.slice(0,5))c.push(t.name.length>n?t.name.substring(0,n):t.name),c.push(a(`  ${t.quantity}x (${t.variant})`,`Rp ${r(t.total)}`,n));c.push(o)}return c.push(s),c.push(i(`LAPORAN RESMI POS SANUBARI`,n)),c.join(`
`)}function H(e,t=`58mm`){let n=V(e,t),r=t===`80mm`?`76mm`:`48mm`,i=t===`80mm`?`80mm auto`:`58mm auto`;c(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Penjualan - ${e.period_title}</title>
    <style>
        @page {
            size: ${i};
            margin: 0;
        }
        body {
            margin: 0;
            padding: 2mm;
            width: ${r};
            font-family: 'Courier New', Courier, monospace, -apple-system;
            font-size: ${t===`80mm`?`12px`:`10.5px`};
            line-height: 1.25;
            color: #000;
            background: #fff;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
            font-family: inherit;
            font-size: inherit;
        }
        @media print {
            body {
                width: 100%;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <pre>${n.replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</pre>
</body>
</html>
    `,n,1,!1,t)}function U(e,t=`58mm`,n){let o=n?.receipt_columns||(t===`80mm`?42:32),s=`-`.repeat(o),c=`=`.repeat(o),l=[];if(l.push(i(e.store_name.toUpperCase(),o)),l.push(i(`LAPORAN LABA RUGI (P&L)`,o)),l.push(c),l.push(a(`Periode:`,e.period_title,o)),l.push(a(`Dicetak:`,e.printed_at,o)),l.push(a(`Kasir:`,e.cashier_name,o)),l.push(s),l.push(i(`1. PENDAPATAN PENJUALAN`,o)),l.push(a(`Total Transaksi`,`${e.total_transactions} Trx`,o)),l.push(a(`Barang Terjual`,`${e.items_sold} Item`,o)),l.push(a(`Penjualan Kotor`,`Rp ${r(e.gross_sales)}`,o)),e.total_discounts>0&&l.push(a(`Diskon Penjualan`,`-Rp ${r(e.total_discounts)}`,o)),l.push(a(`PENJUALAN BERSIH`,`Rp ${r(e.net_sales)}`,o)),l.push(s),l.push(i(`2. HARGA POKOK PENJUALAN`,o)),l.push(a(`Total HPP (COGS)`,`-Rp ${r(e.total_cogs)}`,o)),l.push(s),l.push(i(`3. LABA KOTOR (GROSS)`,o)),l.push(a(`Laba Kotor`,`Rp ${r(e.gross_profit)}`,o)),l.push(a(`Gross Margin`,`${e.gross_margin_pct}%`,o)),l.push(s),e.total_expenses>0||e.expense_breakdown&&e.expense_breakdown.length>0){if(l.push(i(`4. BEBAN KAS OPERASIONAL`,o)),e.expense_breakdown)for(let t of e.expense_breakdown)l.push(a(`- ${t.label}`,`-Rp ${r(t.total)}`,o));l.push(a(`TOTAL BEBAN KAS`,`-Rp ${r(e.total_expenses)}`,o)),l.push(s)}e.other_income>0&&(l.push(a(`Pendapatan Lain`,`+Rp ${r(e.other_income)}`,o)),l.push(s)),l.push(c),l.push(a(`LABA BERSIH (NET)`,`Rp ${r(e.net_profit)}`,o)),l.push(a(`Net Profit Margin`,`${e.net_margin_pct}%`,o)),l.push(c),l.push(i(`ALAT KOPI MALANG POS`,o));let u=n?.margin_feed_lines||2;for(let e=0;e<u;e++)l.push(``);return l.join(`
`)}function W(e,t=`58mm`,n){let r=U(e,t,n),i=t===`80mm`?`76mm`:`48mm`,a=t===`80mm`?`80mm auto`:`58mm auto`,o=n?.margin_horizontal||`1mm`;c(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Laba Rugi - ${e.period_title}</title>
    <style>
        @page {
            size: ${a};
            margin-left: ${o};
            margin-right: ${o};
            margin-top: 0;
            margin-bottom: 0;
        }
        body {
            margin: 0;
            padding: 2mm ${o};
            width: ${i};
            font-family: 'Courier New', Courier, monospace, -apple-system;
            font-size: ${t===`80mm`?`12px`:`10.5px`};
            line-height: 1.25;
            color: #000;
            background: #fff;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
            font-family: inherit;
            font-size: inherit;
        }
        @media print {
            body {
                width: 100%;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <pre>${r.replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</pre>
</body>
</html>
    `,r,1,!1,t)}function G(e){let n=e.items.map((e,n)=>{let i=t(e.variant_label),a=i&&i!==`Default`&&i!==`Standar`?` (${i})`:``;return`${n+1}. *${e.product_name}*${a}\n   ${e.quantity}x @ Rp ${r(e.price)} = Rp ${r(e.subtotal)}`}).join(`

`),i=`*${e.store_name.toUpperCase()}*\n`;return e.tagline&&(i+=`_${e.tagline}_\n`),i+=`========================================
`,i+=`*ESTIMASI PESANAN (PRE-BILL)*
`,i+=`========================================
`,i+=`Status    : Menunggu Pembayaran
`,i+=`Waktu     : ${e.date}\n`,i+=`Kasir     : ${e.cashier_name}\n`,e.customer_name&&e.customer_name.trim()&&(i+=`Pelanggan : ${e.customer_name.trim()}\n`),e.customer_phone&&e.customer_phone.trim()&&(i+=`Telepon   : ${e.customer_phone.trim()}\n`),e.customer_address&&e.customer_address.trim()&&(i+=`Alamat    : ${e.customer_address.trim()}\n`),e.shipping_courier&&(e.shipping_cost||0)>0&&(i+=`Ekspedisi : ${e.shipping_courier.trim()}\n`),e.notes&&e.notes.trim()&&(i+=`Catatan   : ${e.notes.trim()}\n`),i+=`----------------------------------------
`,i+=`*RINCIAN PESANAN:*

`,i+=`${n}\n`,i+=`----------------------------------------
`,i+=`Subtotal  : Rp ${r(e.subtotal)}\n`,e.discount_amount>0&&(i+=`Diskon    : -Rp ${r(e.discount_amount)}\n`),e.shipping_cost&&e.shipping_cost>0&&(i+=`Ongkir    : Rp ${r(e.shipping_cost)}\n`),i+=`*TOTAL TAGIHAN : Rp ${r(e.total_amount)}*\n`,i+=`----------------------------------------
`,(e.bank_info||e.qris_instructions)&&(i+=`*Informasi Pembayaran:*
`,e.bank_info&&(i+=`- Rekening: ${e.bank_info}\n`),e.qris_instructions&&(i+=`- QRIS: ${e.qris_instructions}\n`),i+=`----------------------------------------
`),i+=`Silakan konfirmasi pesanan ini atau lakukan pembayaran di kasir / transfer bank.
Terima kasih!
`,e.instagram&&(i+=`\nInstagram: https://instagram.com/${e.instagram.replace(`@`,``)}\n`),i}function K(e,t){let n=(t||e.customer_phone||``).replace(/[^0-9]/g,``);n.startsWith(`0`)&&(n=`62`+n.substring(1));let r=G(e),i=encodeURIComponent(r);return n?`https://wa.me/${n}?text=${i}`:`https://wa.me/?text=${i}`}function q(e,n=`58mm`){let o=n===`80mm`?42:32,s=`-`.repeat(o),c=`=`.repeat(o),l=[];l.push(i(e.store_name.toUpperCase(),o)),e.tagline&&l.push(i(e.tagline,o)),e.address&&l.push(i(e.address,o)),e.phone&&l.push(i(`Telp/WA: ${e.phone}`,o)),l.push(c),l.push(i(`ESTIMASI PESANAN (PRE-BILL)`,o)),l.push(i(`** BELUM DIBAYAR **`,o)),l.push(s),l.push(a(`Waktu:`,e.date,o)),l.push(a(`Kasir:`,e.cashier_name,o)),e.customer_name&&l.push(a(`Pelanggan:`,e.customer_name,o)),e.customer_phone&&l.push(a(`Telp/WA:`,e.customer_phone,o)),e.customer_address&&l.push(`Alamat: ${e.customer_address}`),l.push(s);for(let n of e.items){let e=n.product_name.length>o?n.product_name.substring(0,o):n.product_name;l.push(e);let i=`  ${n.quantity}x @${r(n.price)} (${t(n.variant_label)})`,s=`Rp ${r(n.subtotal)}`;l.push(a(i,s,o))}if(l.push(s),l.push(a(`Subtotal`,`Rp ${r(e.subtotal)}`,o)),e.discount_amount>0&&l.push(a(`Diskon`,`-Rp ${r(e.discount_amount)}`,o)),e.shipping_cost&&e.shipping_cost>0){let t=e.shipping_courier?` (${e.shipping_courier})`:``;l.push(a(`Ongkir${t}`,`Rp ${r(e.shipping_cost)}`,o))}return l.push(c),l.push(a(`TOTAL TAGIHAN`,`Rp ${r(e.total_amount)}`,o)),l.push(s),e.bank_info&&(l.push(i(`PEMBAYARAN TRANSFER:`,o)),l.push(i(e.bank_info,o)),l.push(s)),l.push(i(`Silakan lakukan pembayaran di kasir`,o)),l.push(i(`Terima kasih!`,o)),l.join(`
`)}function J(e,t=`58mm`){let n=q(e,t);c(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Pre-Bill / Estimasi Pesanan</title>
    <style>
        @page {
            size: ${t===`80mm`?`80mm auto`:`58mm auto`};
            margin: 0;
        }
        body {
            margin: 0;
            padding: 2mm;
            width: ${t===`80mm`?`76mm`:`48mm`};
            font-family: 'Courier New', Courier, monospace, -apple-system;
            font-size: ${t===`80mm`?`12px`:`10.5px`};
            line-height: 1.25;
            color: #000;
            background: #fff;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
            font-family: inherit;
            font-size: inherit;
        }
        @media print {
            body {
                width: 100%;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <pre>${n.replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</pre>
</body>
</html>
    `,n,1,!1,t)}function Y(e){let n=595.28,i=841.89,a=553.28,o=e=>(e||``).replace(/[•★]/g,`*`).replace(/[—–]/g,`-`).replace(/[“”]/g,`"`).replace(/[‘’]/g,`'`).replace(/[^\x20-\x7E]/g,``).replace(/\\/g,`\\\\`).replace(/\(/g,`\\(`).replace(/\)/g,`\\)`),s=(e,t)=>{let n=(e||``).trim();return n.length<=t?n:n.slice(0,t-3)+`...`},c=(e,t)=>{let n=(e||``).replace(/\s+/g,` `).trim();if(!n)return[];let r=n.split(` `),i=[],a=``;for(let e of r)a?(a+` `+e).length<=t?a+=` `+e:(i.push(a),a=e):a=e;return a&&i.push(a),i},l=(e,t,n)=>{let r=(e||``).replace(/[^\x20-\x7E]/g,``);if(t===`F4`)return r.length*n*.6;let i=t===`F2`?.55:.51,a=0;for(let e=0;e<r.length;e++){let t=r[e];`ilI1.,:;!| '()`.includes(t)?a+=n*.28:`MW@%mw`.includes(t)?a+=n*.78:a+=t>=`A`&&t<=`Z`?n*(i+.09):n*i}return a},u=(e,t,n,r,a,s)=>{let c=i-t;return`BT /${r} ${a.toFixed(2)} Tf ${s[0].toFixed(3)} ${s[1].toFixed(3)} ${s[2].toFixed(3)} rg ${e.toFixed(2)} ${c.toFixed(2)} Td (${o(n)}) Tj ET`},d=(e,t,n,r,i,a)=>{let o=l(n,r,i);return u(Math.max(12,e-o),t,n,r,i,a)},f=(e,t,n,r,i,a,o)=>{let s=l(r,i,a);return u(e+Math.max(0,(t-s)/2),n,r,i,a,o)},p=(e,t,n,r,a,o,s=1)=>{let c=i-(t+r),l=[`q`];a&&l.push(`${a[0].toFixed(3)} ${a[1].toFixed(3)} ${a[2].toFixed(3)} rg`),o&&l.push(`${o[0].toFixed(3)} ${o[1].toFixed(3)} ${o[2].toFixed(3)} RG ${s.toFixed(2)} w`);let u=a&&o?`B`:a?`f`:`S`;return l.push(`${e.toFixed(2)} ${c.toFixed(2)} ${n.toFixed(2)} ${r.toFixed(2)} re ${u} Q`),l.join(` `)},m=(e,t,n,r,a,o=1)=>{let s=i-t,c=i-r;return`q ${a[0].toFixed(3)} ${a[1].toFixed(3)} ${a[2].toFixed(3)} RG ${o.toFixed(2)} w ${e.toFixed(2)} ${s.toFixed(2)} m ${n.toFixed(2)} ${c.toFixed(2)} l S Q`},h=(e.store_name||`ALAT KOPI MALANG`).toUpperCase(),g=e.tagline||`Close to Your Every Brew`,_=e.address||`Ruko Tlogomas Square Kav. 34, Jl. Raya Tlogomas, Lowokwaru, Kota Malang`,v=e.phone||`+6282132095241`,y=e.date||``,b=e.cashier_name||`Kasir Sanubari`,x=(e.customer_name||``).trim()||`Pelanggan Sanubari`,S=!!(e.notes&&e.notes.toLowerCase().includes(`no. struk:`)),C=[];C.push(p(0,0,n,i,[1,1,1],null)),C.push(u(42,58,h,`F2`,17,[.067,.094,.153])),C.push(u(42,73,g,`F3`,9.5,[.294,.333,.388]));let w=88;for(let e of c(_,58))C.push(u(42,w,e,`F1`,8.5,[.42,.447,.502])),w+=12;C.push(u(42,w,`Telp/WA: ${v}`,`F1`,8.5,[.42,.447,.502]));let T=387.28;C.push(p(T,44,166,18,[.925,.992,.961],[.655,.953,.816],.8)),C.push(f(T,166,56,`FAKTUR PENJUALAN DIGITAL (A4)`,`F2`,8,[.024,.373,.275])),C.push(d(a,76,`Waktu: ${y} WIB`,`F2`,9.5,[.067,.094,.153])),C.push(d(a,90,`Kasir: ${b}`,`F1`,9,[.294,.333,.388]));let E=S?`LUNAS (PAID)`:`ESTIMASI (PRE-BILL)`,D=S?86:112,O=a-D;S?(C.push(p(O,97,D,16,[.82,.98,.898],[.431,.906,.718],.8)),C.push(f(O,D,108,E,`F2`,8,[.024,.373,.275]))):(C.push(p(O,97,D,16,[.996,.953,.78],[.992,.902,.541],.8)),C.push(f(O,D,108,E,`F2`,8,[.471,.208,.059])));let k=Math.max(w+14,124);C.push(m(42,k,a,k,[.067,.094,.153],1.8));let A=k+18;C.push(u(42,A,`DITUJUKAN KEPADA:`,`F2`,8,[.612,.639,.686])),C.push(u(42,A+15,x,`F2`,12.5,[.067,.094,.153]));let j=A+29;if(e.customer_phone&&e.customer_phone!==`-`&&(C.push(u(42,j,`No. WhatsApp: ${e.customer_phone}`,`F1`,9,[.294,.333,.388])),j+=13),e.customer_address&&e.customer_address!==`Toko Fisik / POS Kasir`)for(let t of c(`Alamat Kirim: ${e.customer_address}`,56))C.push(u(42,j,t,`F1`,8.5,[.216,.255,.318])),j+=12;if(e.shipping_courier&&(e.shipping_cost||0)>0&&(C.push(u(42,j,`Ekspedisi: ${e.shipping_courier}`,`F1`,8.5,[.294,.333,.388])),j+=12),e.notes)for(let t of c(`Catatan: ${e.notes}`,60))C.push(u(42,j,t,`F3`,8.5,[.42,.447,.502])),j+=12;C.push(d(a,A,`STATUS DOKUMEN:`,`F2`,8,[.612,.639,.686])),C.push(d(a,A+14,S?`PEMBAYARAN LUNAS`:`MENUNGGU PEMBAYARAN`,`F2`,9.5,S?[.024,.373,.275]:[.573,.251,.055])),C.push(d(a,A+27,`POS Cashier Digital Invoice`,`F1`,8.5,[.42,.447,.502]));let M=Math.max(j+12,A+46),N=398.28,P=549.28;C.push(f(42,28,M,`NO`,`F2`,8,[.294,.333,.388])),C.push(u(76,M,`DESKRIPSI PRODUK & VARIAN`,`F2`,8,[.294,.333,.388])),C.push(d(N,M,`HARGA`,`F2`,8,[.294,.333,.388])),C.push(f(423.28,40,M,`QTY`,`F2`,8,[.294,.333,.388])),C.push(d(P,M,`JUMLAH (IDR)`,`F2`,8,[.294,.333,.388]));let F=M+8;C.push(m(42,F,a,F,[.82,.835,.859],1.3));for(let n=0;n<e.items.length&&!(F>651.89);n++){let i=e.items[n];C.push(f(42,28,F+16,String(n+1),`F4`,9,[.42,.447,.502])),C.push(u(76,F+14,s(i.product_name,44),`F2`,10,[.067,.094,.153])),C.push(u(76,F+26,`Varian: ${s(t(i.variant_label)||`Standar`,48)}`,`F1`,8.5,[.42,.447,.502])),C.push(d(N,F+19,`Rp ${r(i.price)}`,`F1`,9.5,[.216,.255,.318])),C.push(f(423.28,40,F+19,String(i.quantity),`F2`,9.5,[.067,.094,.153])),C.push(d(P,F+19,`Rp ${r(i.subtotal)}`,`F2`,9.5,[.067,.094,.153])),F+=34,C.push(m(42,F,a,F,[.898,.906,.922],.7))}let I=F+18,L=I;if(e.bank_info||e.qris_instructions){let t=[];e.bank_info&&t.push(...c(`Rekening Bank: ${e.bank_info}`,44)),e.qris_instructions&&t.push(...c(`QRIS: ${e.qris_instructions}`,44));let n=26+t.length*13;C.push(p(42,L,281.204,n,[.976,.98,.984],[.898,.906,.922],.8)),C.push(u(52,L+15,`PETUNJUK PEMBAYARAN TRANSFER / QRIS:`,`F2`,8.5,[.024,.373,.275]));let r=L+29;for(let e of t)C.push(u(52,r,e,`F1`,8.5,[.067,.094,.153])),r+=13;L+=n+14}C.push(p(42,L,148,44,[1,1,1],[.122,.161,.216],1.4)),C.push(f(42,148,L+12,`ALAT KOPI MALANG`,`F2`,7,[.42,.447,.502])),C.push(f(42,148,L+26,S?`* RESMI (LUNAS) *`:`* RESMI (PRE-BILL) *`,`F2`,9.5,[.024,.373,.275])),C.push(f(42,148,L+38,`MALANG - ${y}`,`F4`,6.8,[.612,.639,.686]));let R=1;e.discount_amount>0&&R++,(e.shipping_cost||0)>0&&R++;let z=46+R*16;C.push(p(348.768,I,204.512,z,[.976,.98,.984],[.898,.906,.922],.8));let B=I+18;if(C.push(u(360.768,B,`Subtotal:`,`F1`,9.5,[.294,.333,.388])),C.push(d(541.28,B,`Rp ${r(e.subtotal)}`,`F2`,9.5,[.067,.094,.153])),B+=16,e.discount_amount>0&&(C.push(u(360.768,B,`Potongan Diskon:`,`F1`,9.5,[.016,.471,.341])),C.push(d(541.28,B,`-Rp ${r(e.discount_amount)}`,`F2`,9.5,[.016,.471,.341])),B+=16),(e.shipping_cost||0)>0){let t=`Ongkos Kirim${e.shipping_courier?` (${e.shipping_courier})`:``}:`;C.push(u(360.768,B,s(t,24),`F1`,9.5,[.118,.251,.686])),C.push(d(541.28,B,`Rp ${r(e.shipping_cost||0)}`,`F2`,9.5,[.118,.251,.686])),B+=16}C.push(m(360.768,B-4,541.28,B-4,[.82,.835,.859],1.2)),C.push(u(360.768,B+14,`TOTAL:`,`F2`,10.5,[.067,.094,.153])),C.push(d(541.28,B+15,`Rp ${r(e.total_amount)}`,`F2`,14.5,[.067,.094,.153]));let V=Math.max(L+44+34,I+z+34);C.push(m(42,V,a,V,[.898,.906,.922],.8)),C.push(f(42,511.28,V+16,`Terima kasih telah memesan di Alat Kopi Malang! Dokumen ini adalah faktur digital resmi format A4 yang diterbitkan oleh sistem POS Sanubari.`,`F1`,8,[.612,.639,.686]));let H=C.join(`
`),U=[`<< /Type /Catalog /Pages 2 0 R >>`,`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${n.toFixed(2)} ${i.toFixed(2)}] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R /F4 7 0 R >> >> /Contents 8 0 R >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>`,`<< /Length ${H.length} >>\nstream\n${H}\nendstream`],W=`%PDF-1.4
`,G=[];for(let e=0;e<U.length;e++)G.push(W.length),W+=`${e+1} 0 obj\n${U[e]}\nendobj\n`;let K=W.length,q=U.length+1;W+=`xref\n0 ${q}\n0000000000 65535 f \n`;for(let e of G)W+=`${String(e).padStart(10,`0`)} 00000 n \n`;W+=`trailer\n<< /Size ${q} /Root 1 0 R >>\nstartxref\n${K}\n%%EOF`;let J=new Uint8Array(W.length);for(let e=0;e<W.length;e++)J[e]=W.charCodeAt(e)&255;return J}function X(e){if(typeof window>`u`)return;let t=`Invoice-Sanubari-Roastery-${(e.customer_name||`Pelanggan`).replace(/[^a-zA-Z0-9_-]/g,`-`).replace(/-+/g,`-`).replace(/^-|-$/g,``)||`Pelanggan`}.pdf`;if((E()||/SanubariPOS-Android|wv|Android/i.test(navigator.userAgent||``))&&navigator.onLine)try{let n=JSON.stringify(e),r=T(new TextEncoder().encode(n)).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``),i=`/pos/download-apk?invoice_pdf=1&payload=${encodeURIComponent(r)}`;if(/SanubariPOS-Android/i.test(navigator.userAgent||``)||E()){window.location.href=i;return}let a=document.createElement(`a`);a.href=i,a.download=t,document.body.appendChild(a),a.click(),document.body.removeChild(a);return}catch{}let n=Y(e),r=new Blob([n],{type:`application/pdf`}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=t,a.style.display=`none`,document.body.appendChild(a),a.click(),document.body.removeChild(a),window.setTimeout(()=>{URL.revokeObjectURL(i)},1e4)}export{l as C,M as D,j as E,x as S,I as T,X as _,G as a,H as b,B as c,O as d,_ as f,N as g,D as h,o as i,A as l,m,F as n,K as o,E as p,r,L as s,P as t,h as u,J as v,y as w,z as x,W as y};