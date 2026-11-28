import{n as e}from"./variant-utils-DXp-W0BG.js";function t(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}function n(t){if(!t)return``;let n=t.replace(/\s*\(1\s*kg\s*custom[^)]*\)/gi,``).trim();return e(n)?``:n}function r(e){if(e.bundle_name&&e.bundle_name.trim())return e.bundle_name.trim();if(e.custom_notes){let t=e.custom_notes.match(/^Bundling:\s*(.+?)(?:\s*\(Diskon:.*\))?$/i);if(t&&t[1])return t[1].trim()}return null}function i(e){let t=[],n=new Map;for(let i of e){let e=r(i);if(!e){t.push({type:`single`,item:i});continue}let a=i.bundle_id?`id:${i.bundle_id}`:`name:${e}`,o=i.bundle_unit_qty&&i.bundle_unit_qty>0?i.bundle_unit_qty:1,s=Math.max(1,Math.round(i.quantity/o)),c=i.price*i.quantity,l=i.subtotal??Math.max(0,c-(i.discount_amount||0)),u=i.price*o,d=Math.round(l/s),f=n.get(a);if(f!==void 0){let e=t[f];e.type===`bundle`&&(e.totalNormal+=c,e.totalDiscounted+=l,e.items.push({product_name:i.product_name,variant_label:i.variant_label,unit_qty:o,normal_line_price:u,discounted_line_price:d}))}else n.set(a,t.length),t.push({type:`bundle`,bundleName:e,bundleQty:s,totalNormal:c,totalDiscounted:l,items:[{product_name:i.product_name,variant_label:i.variant_label,unit_qty:o,normal_line_price:u,discounted_line_price:d}]})}return t}function a(e){let t=0,n=0,r=0,i=!1,a=``,o=0;for(let s of e){if(!s.custom_notes)continue;let e=s.custom_notes.match(/Total:\s*Rp\s*([\d.]+)\s*\|\s*DP\s*\(([^)]+)\):\s*Rp\s*([\d.]+)\s*\|\s*Sisa:\s*Rp\s*([\d.]+)/i);if(e){i=!0,o++;let s=e=>Number(e.replace(/\./g,``))||0;t+=s(e[1]),a=e[2],n+=s(e[3]),r+=s(e[4])}}if(!i)return null;let s=t>0?n/t*100:0,c=o===1&&a?a:`${Number.isInteger(s)?s:s.toFixed(1).replace(/\.0$/,``)}%`;return{totalFull:t,dpPaid:n,dpRemaining:r,dpPercentLabel:c}}function o(e,r={}){let o=(r.paper_width||`80mm`)===`80mm`||r.custom_paper_width_mm&&r.custom_paper_width_mm>=75,c=o?`11px`:`9.5px`,l=o?`14px`:`12px`,u=o?`14px`:`12px`,d=r.font_family||`sans-serif`,f=`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Plus Jakarta Sans', Helvetica, Arial, sans-serif`;d===`consolas`||d===`monospace`?f=`'Consolas', 'Courier New', monospace`:d===`courier`?f=`'Courier New', Courier, monospace`:d===`roboto-mono`&&(f=`'Roboto Mono', monospace`);let p=i(e.items).map(e=>{if(e.type===`bundle`){let r=e.items.map((e,r)=>{let i=n(e.variant_label),a=!!i;return`
                            <tr>
                                <td colspan="2" style="padding-left: 6px; padding-top: 2px; font-size: 9.5px; color: #555; font-weight: 700;">
                                    ITEM ${r+1}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-left: 6px; font-size: ${c}; color: #111;">
                                    ${t(e.product_name)}${a?` (${t(i)})`:``}
                                </td>
                                <td style="text-align: right; white-space: nowrap; font-weight: 700; font-size: ${c}; color: #000;">
                                    ${e.unit_qty}x Rp ${s(e.discounted_line_price)}
                                </td>
                            </tr>
                        `}).join(``);return`
                    <tr>
                        <td colspan="2" style="font-weight: 800; padding-top: 5px; font-size: ${c}; color: #000;">
                            ${t(e.bundleName)}
                        </td>
                    </tr>
                    ${r}
                    <tr>
                        <td style="font-weight: 700; padding-top: 3px; padding-bottom: 5px; font-size: ${c}; color: #000; border-bottom: 1px dashed #ccc;">
                            Total Harga Paket (${e.bundleQty}x)
                        </td>
                        <td style="text-align: right; font-weight: 800; padding-top: 3px; padding-bottom: 5px; white-space: nowrap; font-size: ${c}; color: #000; border-bottom: 1px dashed #ccc;">
                            Rp ${s(e.totalDiscounted)}
                        </td>
                    </tr>
                `}let r=e.item,i=n(r.variant_label),a=i?` (${t(i)})`:``;return`
            <tr>
                <td colspan="2" style="font-weight: 700; padding-top: 4px; font-size: ${c}; color: #000; line-height: 1.3;">
                    ${t(r.product_name)}${a}
                </td>
            </tr>
            <tr>
                <td style="text-align: left; padding-left: 4px; padding-bottom: 4px; font-size: ${c}; color: #222;">
                    ${r.quantity} x Rp ${s(r.price)}
                </td>
                <td style="text-align: right; font-weight: 700; padding-bottom: 4px; white-space: nowrap; font-size: ${c}; color: #000; font-variant-numeric: tabular-nums;">
                    Rp ${s(r.subtotal)}
                </td>
            </tr>
            ${r.custom_notes&&!/^Bundling:/i.test(r.custom_notes)?`
            <tr>
                <td colspan="2" style="padding-left: 6px; padding-bottom: 4px; font-size: 9.5px; color: #333; line-height: 1.3;">
                    ${t(r.custom_notes)}
                </td>
            </tr>
            `:``}
        `}).join(``);return`
    <div class="sanubari-receipt-body" style="width: 100%; box-sizing: border-box; color: #000000; font-family: ${f}; font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 8px;">
            ${r.show_logo===!1?``:`<div style="font-weight: 900; font-size: ${l}; letter-spacing: 1px; text-transform: uppercase;">ALAT KOPI MALANG</div>`}
            <div style="font-size: ${l}; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">
                ${t(e.store_name||`Alat Kopi Malang`)}
            </div>
            ${e.tagline?`<div style="font-size: 10px; font-style: italic; color: #333; margin-top: 1px;">${t(e.tagline)}</div>`:``}
            ${e.address?`<div style="font-size: 9.5px; line-height: 1.3; color: #333; margin-top: 2px;">${t(e.address)}</div>`:``}
            ${e.phone?`<div style="font-size: 9.5px; color: #333;">WA: ${t(e.phone)}</div>`:``}
        </div>

        <div style="border-bottom: 1.5px dashed #000000; margin: 6px 0;"></div>

        <!-- Refund Notice -->
        ${e.is_refund?`
            <div style="text-align: center; font-weight: 900; font-size: ${c}; margin: 4px 0;">
                *** BUKTI REFUND / RETUR ***<br>
                <span style="font-size: 9.5px;">Alasan: ${t(e.refund_reason||`Pengembalian Kasir`)}</span>
            </div>
            <div style="border-bottom: 1px dashed #000000; margin: 4px 0;"></div>
        `:``}

        <!-- Order Meta -->
        <table style="width: 100%; font-size: 10px; border-collapse: collapse; margin-bottom: 4px; color: #000; font-variant-numeric: tabular-nums;">
            <tr>
                <td style="text-align: left; font-weight: 800;">No: #${t(e.order_number)}</td>
                <td style="text-align: right; white-space: nowrap; font-weight: 500;">${t(e.date)}</td>
            </tr>
            <tr>
                <td style="text-align: left;">Kasir: ${t(e.cashier_name)}</td>
                <td style="text-align: right; white-space: nowrap;">
                    ${e.customer_name&&e.customer_name!==`Pelanggan Kasir`?t(e.customer_name):``}
                </td>
            </tr>
            ${e.customer_address&&e.customer_address!==`Toko Fisik / POS Kasir`?`
            <tr>
                <td colspan="2" style="text-align: left; font-size: 9px; padding-top: 2px;">
                    Alamat: ${t(e.customer_address)}
                </td>
            </tr>
            `:``}
        </table>

        <div style="border-bottom: 1px dashed #000000; margin: 6px 0;"></div>

        <!-- Items -->
        <table style="width: 100%; border-collapse: collapse; color: #000;">
            ${p}
        </table>

        <div style="border-bottom: 1px dashed #000000; margin: 6px 0;"></div>

        <!-- Totals -->
        <table style="width: 100%; font-size: ${c}; border-collapse: collapse; color: #000; font-variant-numeric: tabular-nums;">
            ${(()=>{let n=a(e.items);return n?`
            <tr>
                <td style="text-align: left; padding: 2px 0;">Total Pesanan (Full)</td>
                <td style="text-align: right; white-space: nowrap; font-weight: 700;">Rp ${s(n.totalFull)}</td>
            </tr>
            <tr>
                <td style="text-align: left; padding: 2px 0; font-weight: 700;">DP Dibayar (${t(n.dpPercentLabel)})</td>
                <td style="text-align: right; white-space: nowrap; font-weight: 700;">Rp ${s(n.dpPaid)}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #999;">
                <td style="text-align: left; padding: 2px 0 4px; font-weight: 700;">Sisa Pelunasan</td>
                <td style="text-align: right; white-space: nowrap; font-weight: 700; padding-bottom: 4px;">Rp ${s(n.dpRemaining)}</td>
            </tr>
            `:``})()}
            <tr>
                <td style="text-align: left; padding: 2px 0;">Subtotal</td>
                <td style="text-align: right; white-space: nowrap; font-weight: 700;">Rp ${s(e.subtotal)}</td>
            </tr>
            ${e.discount_amount>0?`
            <tr>
                <td style="text-align: left; padding: 2px 0; font-weight: 700;">Diskon</td>
                <td style="text-align: right; font-weight: 700; white-space: nowrap;">-Rp ${s(e.discount_amount)}</td>
            </tr>
            `:``}
            ${e.shipping_cost&&e.shipping_cost>0?`
            <tr>
                <td style="text-align: left; padding: 2px 0;">Ongkir (${t(e.shipping_courier||`Kurir`)})</td>
                <td style="text-align: right; white-space: nowrap;">Rp ${s(e.shipping_cost)}</td>
            </tr>
            `:``}
            <tr style="border-top: 1.5px dashed #000000;">
                <td style="text-align: left; font-weight: 900; font-size: ${u}; padding: 5px 0;">TOTAL</td>
                <td style="text-align: right; font-weight: 900; font-size: ${u}; padding: 5px 0; white-space: nowrap;">
                    Rp ${s(e.total_amount)}
                </td>
            </tr>
            <tr>
                <td style="text-align: left; padding: 2px 0;">Metode Bayar</td>
                <td style="text-align: right; font-weight: 700; text-transform: uppercase;">
                    ${t(e.payment_method_label)}
                </td>
            </tr>
            ${e.cash_tendered&&e.cash_tendered>0?`
            <tr>
                <td style="text-align: left; padding: 2px 0;">Tunai Diterima</td>
                <td style="text-align: right; white-space: nowrap;">Rp ${s(e.cash_tendered)}</td>
            </tr>
            <tr>
                <td style="text-align: left; padding: 2px 0; font-weight: 700;">Kembalian</td>
                <td style="text-align: right; font-weight: 700; white-space: nowrap;">Rp ${s(e.cash_change||0)}</td>
            </tr>
            `:``}
        </table>

        <div style="border-bottom: 1.5px dashed #000000; margin: 6px 0;"></div>

        <!-- Footer -->
        <div style="text-align: center; font-size: 9.5px; margin-top: 8px; line-height: 1.4; color: #000;">
            ${e.footer_note?e.footer_note.split(`
`).map(e=>`<div>${t(e)}</div>`).join(``):`<div>Terima kasih atas pesanannya</div>`}
            ${e.instagram?`<div style="margin-top: 3px; font-weight: 800; letter-spacing: 0.2px;">IG: ${t(e.instagram)}</div>`:``}
        </div>
    </div>
    `}function s(e){let t=typeof e==`number`&&!isNaN(e)?e:0;return new Intl.NumberFormat(`id-ID`).format(t)}function c(e,t){if(e.length>=t)return e.substring(0,t);let n=Math.floor((t-e.length)/2),r=t-e.length-n;return` `.repeat(n)+e+` `.repeat(r)}function l(e,t,n){let r=Math.max(1,n-e.length-t.length);return e+` `.repeat(r)+t}function u(e,t=`58mm`){let r=typeof t==`string`?{paper_width:t}:t||{},o=r.paper_width||`58mm`,u=o===`custom`,d=Number(r.receipt_columns)||(u?Number(r.custom_receipt_columns)||40:o===`80mm`?Number(r.receipt_columns_80mm)||44:Number(r.receipt_columns_58mm)||32),f=Number(r.max_item_name_length)||(d>=44?Math.min(d-12,34):d>=38?26:Math.min(d-10,22)),p=r.show_logo??!0,m=Number(r.margin_feed_lines)??2,h=`-`.repeat(d),g=`=`.repeat(d),_=[];p&&_.push(c(`*** ALAT KOPI MALANG ***`,d)),_.push(c(e.store_name.toUpperCase(),d)),e.tagline&&_.push(c(e.tagline,d)),e.address&&_.push(c(e.address,d)),e.phone&&_.push(c(`WA: ${e.phone}`,d)),_.push(g),e.is_refund&&(_.push(c(`*** BUKTI REFUND / RETUR ***`,d)),_.push(c(`DANA TELAH DIKEMBALIKAN`,d)),e.refund_reason&&_.push(l(`Alasan: ${e.refund_reason}`,``,d)),_.push(g)),_.push(l(`No: #${e.order_number}`,``,d)),_.push(l(`Tgl: ${e.date}`,`Kasir: ${e.cashier_name}`,d)),e.customer_name&&e.customer_name!==`Pelanggan Kasir`&&_.push(l(`Pelanggan: ${e.customer_name}`,``,d)),e.customer_phone&&e.customer_phone!==`-`&&_.push(l(`Telp/WA: ${e.customer_phone}`,``,d)),e.customer_address&&e.customer_address!==`Toko Fisik / POS Kasir`&&_.push(`Alamat: ${e.customer_address}`),_.push(h);for(let t of i(e.items)){if(t.type===`bundle`){_.push(t.bundleName.substring(0,d)),t.items.forEach((e,t)=>{let r=n(e.variant_label),i=r&&r!==`Standard`&&r!==`Standar`;_.push(`  ITEM ${t+1}: ${e.product_name}${i?` (${r})`:``}`.substring(0,d)),_.push(l(`    ${e.unit_qty}x`,s(e.discounted_line_price),d))}),_.push(l(`Total Paket (${t.bundleQty}x)`,s(t.totalDiscounted),d));continue}let e=t.item,r=n(e.variant_label),i=r?`${e.product_name} (${r})`:e.product_name,a=Math.min(f,d);if(i.length<=a)_.push(i);else{let e=i;for(;e.length>0;){if(e.length<=a){_.push(e);break}let t=e.lastIndexOf(` `,a);t<=0&&(t=a),_.push(e.substring(0,t)),e=e.substring(t).trim()}}let o=`  ${e.quantity}x ${s(e.price)}`,c=s(e.subtotal);if(_.push(l(o,c,d)),e.custom_notes&&!/^Bundling:/i.test(e.custom_notes)){let t=e.custom_notes.trim(),n=Math.max(12,d-2);for(;t.length>0;){if(t.length<=n){_.push(`  ${t}`);break}let e=t.lastIndexOf(` `,n);e<=0&&(e=n),_.push(`  ${t.substring(0,e)}`),t=t.substring(e).trim()}}}_.push(h);let v=a(e.items);if(v&&(_.push(l(`Total Pesanan`,`Rp ${s(v.totalFull)}`,d)),_.push(l(`DP (${v.dpPercentLabel})`,`Rp ${s(v.dpPaid)}`,d)),_.push(l(`Sisa Pelunasan`,`Rp ${s(v.dpRemaining)}`,d)),_.push(h)),_.push(l(`Subtotal`,`Rp ${s(e.subtotal)}`,d)),e.discount_amount>0&&_.push(l(`Diskon`,`-Rp ${s(e.discount_amount)}`,d)),e.shipping_cost&&e.shipping_cost>0){let t=e.shipping_courier?` (${e.shipping_courier})`:``;_.push(l(`Ongkir${t}`,`Rp ${s(e.shipping_cost)}`,d))}_.push(l(`TOTAL`,`Rp ${s(e.total_amount)}`,d)),_.push(h),e.is_refund&&(_.push(l(`TOTAL REFUND`,`Rp ${s(e.refund_amount||e.total_amount)}`,d)),_.push(l(`Status Kasir`,`SUDAH DI-REFUND`,d)),_.push(h)),_.push(l(`Metode Bayar`,e.payment_method_label,d)),e.cash_tendered&&e.cash_tendered>0&&(_.push(l(`Bayar Tunai`,`Rp ${s(e.cash_tendered)}`,d)),_.push(l(`Kembalian`,`Rp ${s(e.cash_change||0)}`,d))),_.push(g),e.footer_note&&e.footer_note.split(`
`).forEach(e=>_.push(c(e,d))),e.instagram&&_.push(c(`IG: ${e.instagram}`,d));for(let e=0;e<m;e++)_.push(``);return _.join(`
`)}function d(e,t=!1,n=`58mm`){let r=new TextEncoder().encode(e+`


`),i=new Uint8Array([27,64]),a=t?new Uint8Array([27,112,0,25,250]):new Uint8Array([]),o=n===`80mm`?new Uint8Array([29,86,0]):new Uint8Array([]),s=new Uint8Array(i.length+a.length+r.length+o.length),c=0;return s.set(i,c),c+=i.length,a.length>0&&(s.set(a,c),c+=a.length),s.set(r,c),c+=r.length,o.length>0&&(s.set(o,c),c+=o.length),s}function f(e,t,n=1,r=!1,i=`58mm`,a){if(typeof window>`u`||typeof document>`u`)return;let o=window.electronAPI;if(o&&typeof o.printReceipt==`function`){(async()=>{let n=`sanubari-pos-direct-print-root`,r=`sanubari-pos-direct-print-style`,s=document.getElementById(n);s&&s.parentNode&&s.parentNode.removeChild(s);let c=document.getElementById(r);c&&c.parentNode&&c.parentNode.removeChild(c);let l=i===`custom`||a?.paper_width===`custom`,u=Math.max(30,Math.min(120,Number(a?.custom_paper_width_mm)||58)),d=Math.max(20,Math.min(u,Number(a?.custom_printable_width_mm)||u-4)),f=l?`${d}mm`:i===`80mm`?a?.custom_printable_width_mm?`${a.custom_printable_width_mm}mm`:`72mm`:`48mm`,p=l?`${u}mm auto`:i===`80mm`?`80mm auto`:`58mm auto`,m=i===`80mm`||l&&u>=75?`12px`:`10.5px`,h=a?.font_family||`sans-serif`,g=`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Plus Jakarta Sans', sans-serif`;h===`courier`?g=`'Courier New', Courier, monospace`:h===`consolas`||h===`monospace`?g=`'Consolas', 'Courier New', monospace`:h===`roboto-mono`&&(g=`'Roboto Mono', monospace`);let _=document.createElement(`style`);_.id=r,_.textContent=`
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
            `,document.head.appendChild(_);let v=e.match(/<body[^>]*>([\s\S]*?)<\/body>/i),y=v?v[1]:`<pre>${(t||``).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</pre>`,b=document.createElement(`div`);b.id=n,b.innerHTML=y,document.body.appendChild(b);try{let e=a?.printer_name||a?.usb_printer_name||``;if(typeof o.getPrinters==`function`)try{let t=await o.getPrinters();if(Array.isArray(t)&&t.length>0){if(e){let n=t.find(t=>t.name&&t.name.toLowerCase()===e.toLowerCase()||t.displayName&&t.displayName.toLowerCase()===e.toLowerCase());n&&(e=n.name)}if(!e){let n=t.find(e=>e.isDefault),r=t.find(e=>/pos80|pos58|pos-|thermal|receipt|tm-t|tm-u|xprinter|eppos|vsc|blueprint|panda|iware|codesoft|rpp|mtp/i.test(`${e.name||``} ${e.displayName||``}`)),i=e=>/microsoft print to pdf|xps document writer|onenote|fax/i.test(e||``),a=t.find(e=>!i(e.name));n&&!i(n.name)?e=n.name:r?e=r.name:a?e=a.name:n&&(e=n.name)}}}catch{}await new Promise(e=>requestAnimationFrame(()=>setTimeout(e,30)));let t=l?u*1e3:i===`80mm`?8e4:58e3,n=await o.printReceipt({silent:!0,printerName:e,pageSize:{width:t,height:2e5}});(!n||!n.success)&&(n=await o.printReceipt({silent:!0,printerName:e,pageSize:`A4`})),(!n||!n.success)&&e!==``&&await o.printReceipt({silent:!0,printerName:``,pageSize:`A4`})}finally{b.parentNode&&b.parentNode.removeChild(b),_.parentNode&&_.parentNode.removeChild(_)}})();return}if(A()&&t){let e=M();if(e&&e.address)try{let a=k(d(t,r,i));window.SanubariAndroidBluetooth.printEscPosBase64(a,e.address,Math.max(1,n));return}catch{}}let s=`sanubari-pos-silent-print-frame`,c=document.getElementById(s);c&&c.parentNode&&c.parentNode.removeChild(c);let l=document.createElement(`iframe`);l.id=s,l.setAttribute(`aria-hidden`,`true`),l.style.position=`fixed`,l.style.right=`0`,l.style.bottom=`0`,l.style.width=`0`,l.style.height=`0`,l.style.border=`0`,l.style.opacity=`0`,l.style.pointerEvents=`none`,l.style.zIndex=`-1`,document.body.appendChild(l);let u=l.contentWindow,f=l.contentDocument||u?.document;if(!f||!u)return;let p=!1,m=()=>{if(!p){p=!0;try{u.focus(),u.print()}catch{}window.setTimeout(()=>{l.parentNode&&l.parentNode.removeChild(l)},3e4)}};l.onload=m,f.open(),f.write(e),f.close(),window.setTimeout(m,80)}function p(e,t=`58mm`){let n=typeof t==`string`?{paper_width:t}:t||{},r=n.paper_width||`58mm`,i=r===`custom`,a=Math.max(30,Math.min(120,Number(n.custom_paper_width_mm)||58)),s=Math.max(20,Math.min(a,Number(n.custom_printable_width_mm)||a-4)),c=n.margin_horizontal||`2mm`,l=Math.max(1,Number(n.copies)||1),d=u(e,n),p=i?`${s}mm`:r===`80mm`?n.custom_printable_width_mm?`${n.custom_printable_width_mm}mm`:`72mm`:`48mm`,m=i?`${a}mm auto`:r===`80mm`?`80mm auto`:`58mm auto`,h=n.font_family||`sans-serif`,g=`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Plus Jakarta Sans', Helvetica, Arial, sans-serif`;h===`courier`?g=`'Courier New', Courier, monospace`:h===`consolas`||h===`monospace`?g=`'Consolas', 'Lucida Console', 'Courier New', monospace`:h===`roboto-mono`&&(g=`'Roboto Mono', monospace, 'Courier New'`);let _=n.font_size||`normal`,v=r===`80mm`||i&&a>=75?`12px`:`10.5px`;_===`compact`?v=r===`80mm`||i&&a>=75?`10.5px`:`9.5px`:_===`large`&&(v=r===`80mm`||i&&a>=75?`14px`:`12px`);let y=(n.font_weight||`normal`)===`bold`?`bold`:`normal`,b=n.formatting===`plain`?`<pre>${d.replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</pre>`:o(e,n),x=[`SALINAN PELANGGAN`,`SALINAN KASIR / TOKO`,`SALINAN BAR / DAPUR`],S=``;for(let e=0;e<l;e++){let t=l>1?`<div style="text-align:center;font-weight:bold;font-size:10px;padding:3px 0;margin-bottom:4px;border-bottom:1px dashed #000;">[ ${x[e]||`SALINAN #${e+1}`} ]</div>`:``,n=e<l-1?`<div style="text-align:center;font-size:10px;margin:12px 0;border-top:1px dashed #000;padding-top:4px;color:#000;">- - - - - POTONG DI SINI - - - - -</div>`:``;S+=`<div class="receipt-copy">${t}${b}</div>${n}`}f(`
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
            padding: 2mm ${c};
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
                padding: 0 ${c};
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
    `,d,l,!!n.open_cash_drawer,r,n)}function m(e,t=`58mm`){let n=typeof t==`string`?{paper_width:t}:t||{},r=u(e,n),i=new TextEncoder().encode(r+`


`),a=new Uint8Array([27,64]),o=n.font_size===`compact`?new Uint8Array([27,77,1]):new Uint8Array([27,77,0]),s=n.font_weight===`bold`?new Uint8Array([27,69,1]):new Uint8Array([27,69,0]),c=n.open_cash_drawer?new Uint8Array([27,112,0,25,250]):new Uint8Array([]),l=(n.paper_width||`58mm`)===`80mm`,d=n.paper_width===`custom`,f=Number(n.custom_paper_width_mm)||58,p=l||d&&f>=75?new Uint8Array([29,86,0]):new Uint8Array([]),m=a.length+o.length+s.length+c.length+i.length+p.length,h=new Uint8Array(m),g=0;return h.set(a,g),g+=a.length,h.set(o,g),g+=o.length,h.set(s,g),g+=s.length,c.length>0&&(h.set(c,g),g+=c.length),h.set(i,g),g+=i.length,p.length>0&&(h.set(p,g),g+=p.length),h}var h=`sanubari_pos_usb_printer_v1`,g=null,_=null;function v(){return typeof window<`u`&&!!window.electronAPI?.isDesktop}async function y(){if(typeof window>`u`)return[];let e=window.electronAPI;if(e&&typeof e.getPrinters==`function`)try{let t=await e.getPrinters();if(Array.isArray(t))return t.map(e=>({name:e.name||``,displayName:e.displayName||e.name||``,isDefault:!!e.isDefault,description:e.description||``,status:e.status}))}catch(e){console.warn(`Failed to get printers from electronAPI:`,e)}return[]}function b(){return typeof navigator<`u`&&`usb`in navigator&&typeof navigator.usb?.requestDevice==`function`}function x(){if(typeof window>`u`)return null;try{let e=localStorage.getItem(h);return e?JSON.parse(e):null}catch{return null}}function S(e){if(!(typeof window>`u`))try{e?localStorage.setItem(h,JSON.stringify(e)):localStorage.removeItem(h)}catch{}}async function C(){if(!b())return!1;try{let e=x();if(!e)return!1;let t=(await navigator.usb.getDevices()).find(t=>t.vendorId===e.vendorId&&t.productId===e.productId);if(!t)return!1;await t.open(),t.configuration===null&&await t.selectConfiguration(1);let n=null,r=null;if(t.configuration&&Array.isArray(t.configuration.interfaces))for(let e of t.configuration.interfaces){for(let t of e.alternates||[]){for(let i of t.endpoints||[])if(i.direction===`out`&&(i.type===`bulk`||i.type===`interrupt`)){n=e.interfaceNumber,r=i.endpointNumber;break}if(r!==null)break}if(r!==null)break}if(n!==null)try{await t.claimInterface(n)}catch{}return g=t,_=r,!0}catch{return!1}}async function w(){if(!b())throw Error(`Browser ini tidak mendukung WebUSB. Silakan gunakan Google Chrome atau Microsoft Edge di Windows.`);let e=await navigator.usb.requestDevice({filters:[]});if(!e)return null;await e.open(),e.configuration===null&&await e.selectConfiguration(1);let t=null,n=null;if(e.configuration&&Array.isArray(e.configuration.interfaces))for(let r of e.configuration.interfaces){for(let e of r.alternates||[]){for(let i of e.endpoints||[])if(i.direction===`out`&&(i.type===`bulk`||i.type===`interrupt`)){t=r.interfaceNumber,n=i.endpointNumber;break}if(n!==null)break}if(n!==null)break}if(t!==null)try{await e.claimInterface(t)}catch{}g=e,_=n;let r=`0x`+e.vendorId.toString(16).padStart(4,`0`).toUpperCase(),i=`0x`+e.productId.toString(16).padStart(4,`0`).toUpperCase(),a={name:e.productName||`Thermal USB Printer (${r}:${i})`,vendorId:e.vendorId,productId:e.productId,productName:e.productName||`Thermal POS Printer`,manufacturerName:e.manufacturerName,serialNumber:e.serialNumber,connected:!0};return S(a),a}async function T(e,t=`58mm`){let n=m(e,typeof t==`string`?{paper_width:t}:t||{});if((!g||!g.opened)&&!await C()&&!await w())return!1;if(!g)throw Error(`Printer USB tidak terhubung.`);let r=_??1;return await g.transferOut(r,n),!0}var E=`sanubari_pos_bt_printer_v1`,D=null,O=null;function k(e){let t=``,n=e.byteLength;for(let r=0;r<n;r++)t+=String.fromCharCode(e[r]);return typeof window<`u`?window.btoa(t):``}function A(){if(typeof window>`u`)return!1;let e=window.SanubariAndroidBluetooth;try{return!!(e&&typeof e.isNativeAvailable==`function`&&e.isNativeAvailable())}catch{return!!e}}function j(){return typeof navigator>`u`?!1:!!navigator.bluetooth}function M(){if(typeof window>`u`)return null;if(A())try{let e=window.SanubariAndroidBluetooth.getStatus(),t=JSON.parse(e);if(t&&t.savedAddress)return{name:t.savedName||`Printer (${t.savedAddress})`,address:t.savedAddress,bonded:!0,isPrinter:!0,connected:!0,source:`android-native`}}catch{}if(D&&O)return{name:D.name||`Printer Bluetooth (Web)`,address:D.id||`WEB-BT`,bonded:!0,isPrinter:!0,connected:!!D.gatt?.connected,source:`web-bluetooth`};try{let e=window.localStorage.getItem(E);if(e)return JSON.parse(e)}catch{}return null}function N(e){if(!(typeof window>`u`))try{e?window.localStorage.setItem(E,JSON.stringify(e)):window.localStorage.removeItem(E)}catch{}}function P(){if(!A())return[];try{let e=window.SanubariAndroidBluetooth.getDevices(),t=JSON.parse(e);return Array.isArray(t)?t.sort((e,t)=>e.connected&&!t.connected?-1:!e.connected&&t.connected?1:e.isPrinter&&!t.isPrinter?-1:!e.isPrinter&&t.isPrinter?1:e.bonded&&!t.bonded?-1:!e.bonded&&t.bonded?1:(e.name||``).localeCompare(t.name||``)):[]}catch{return[]}}function F(){if(!A())return!1;try{return window.SanubariAndroidBluetooth.startScan(),!0}catch{return!1}}function I(){if(A())try{window.SanubariAndroidBluetooth.stopScan()}catch{}}function L(){if(A())try{window.SanubariAndroidBluetooth.openBluetoothSettings();return}catch{}if(typeof window<`u`)try{window.location.href=`intent:#Intent;action=android.settings.BLUETOOTH_SETTINGS;end`}catch{}}function R(e){return new Promise(t=>{if(!A()){t({success:!1,message:`Jembatan Bluetooth Native Android tidak tersedia.`});return}let n=!1,r=window.setTimeout(()=>{n||(n=!0,window.removeEventListener(`sanubari-bt-connect-result`,i),t({success:!1,address:e,message:`Waktu koneksi habis (timeout). Pastikan printer Bluetooth menyala dan berada di dekat perangkat.`}))},16e3),i=a=>{if(n)return;let o=a.detail||{};o.disconnected||(n=!0,window.clearTimeout(r),window.removeEventListener(`sanubari-bt-connect-result`,i),o.success&&N({name:o.name||`Printer (${e})`,address:o.address||e,bonded:!0,isPrinter:!0,connected:!0,source:`android-native`}),t({success:!!o.success,name:o.name,address:o.address||e,message:o.message||(o.success?`Terhubung ke printer!`:`Gagal menghubungkan printer.`)}))};window.addEventListener(`sanubari-bt-connect-result`,i);try{window.SanubariAndroidBluetooth.connectDevice(e)}catch(a){n||(n=!0,window.clearTimeout(r),window.removeEventListener(`sanubari-bt-connect-result`,i),t({success:!1,address:e,message:a?.message||`Gagal memanggil koneksi Bluetooth Android.`}))}})}function z(){if(N(null),A())try{window.SanubariAndroidBluetooth.disconnectDevice()}catch{}if(D){try{D.gatt?.connected&&D.gatt.disconnect()}catch{}D=null,O=null}}async function B(){let e=navigator;if(!e.bluetooth)throw Error(`Web Bluetooth tidak tersedia di browser ini.`);try{let t=await e.bluetooth.requestDevice({acceptAllDevices:!0,optionalServices:[`000018f0-0000-1000-8000-00805f9b34fb`,`49535343-fe7d-4ae5-8fa9-9fafd205e455`,`0000e0ff-0000-1000-8000-00805f9b34fb`,`0000ff00-0000-1000-8000-00805f9b34fb`,`e7810a71-73ae-499d-8c15-faa9aef0c3f1`]});if(!t.gatt)throw Error(`Perangkat printer tidak mendukung koneksi GATT.`);let n=await(await t.gatt.connect()).getPrimaryServices(),r=null;for(let e of n){let t=await e.getCharacteristics();for(let e of t)if(e.properties.write||e.properties.writeWithoutResponse){r=e;break}if(r)break}if(!r)throw Error(`Tidak ditemukan karakteristik cetak pada perangkat Bluetooth ini.`);D=t,O=r;let i={name:t.name||`Printer Bluetooth`,address:t.id||`WEB-BT`,bonded:!0,isPrinter:!0,connected:!0,source:`web-bluetooth`};return N(i),i}catch(e){if(e?.name===`NotFoundError`)return null;throw e}}function V(e,t=`58mm`){return`rawbt:base64,${k(m(e,typeof t==`string`?{paper_width:t}:t||{}))}`}function H(e,t=`58mm`,n){return new Promise(r=>{if(!A()){r({success:!1,message:`Fitur Bluetooth Native Android belum aktif.`});return}let i=typeof t==`string`?{paper_width:t}:t||{},a=Math.max(1,Number(i.copies)||1),o=k(m(e,i)),s=M(),c=n||s?.address||``,l=!1,u=window.setTimeout(()=>{l||(l=!0,window.removeEventListener(`sanubari-bt-print-result`,d),r({success:!1,message:`Waktu cetak habis (timeout). Pastikan printer Bluetooth menyala dan kertas tersedia.`}))},2e4),d=e=>{if(l)return;l=!0,window.clearTimeout(u),window.removeEventListener(`sanubari-bt-print-result`,d);let t=e.detail||{};r({success:!!t.success,needSelectPrinter:!!t.needSelectPrinter,name:t.name,address:t.address,message:t.message||(t.success?`Struk berhasil dicetak!`:`Gagal mencetak struk.`)})};window.addEventListener(`sanubari-bt-print-result`,d);try{window.SanubariAndroidBluetooth.printEscPosBase64(o,c,a)}catch(e){l||(l=!0,window.clearTimeout(u),window.removeEventListener(`sanubari-bt-print-result`,d),r({success:!1,message:e?.message||`Gagal mengirim data cetak ke printer Bluetooth.`}))}})}async function U(e,t=`58mm`,n){if(A()){let r=await H(e,t,n);if(!r.success){let e=Error(r.message);throw e.needSelectPrinter=r.needSelectPrinter,e}return!0}if(!navigator.bluetooth){let e=Error(`Web Bluetooth tidak didukung di WebView ini. Gunakan fitur Pencarian Printer Bluetooth di aplikasi.`);throw e.code=`BT_UNSUPPORTED_WEBVIEW`,e}let r=typeof t==`string`?{paper_width:t}:t||{},i=Math.max(1,Number(r.copies)||1);try{let t=O;if(!t||!D?.gatt?.connected){if(!await B())return!1;t=O}if(!t)throw Error(`Tidak ditemukan karakteristik cetak pada printer Bluetooth ini.`);let n=m(e,r);for(let e=0;e<i;e++){for(let e=0;e<n.length;e+=100){let r=n.slice(e,e+100);t.properties.write?await t.writeValueWithResponse(r):await t.writeValueWithoutResponse(r),await new Promise(e=>setTimeout(e,20))}e<i-1&&await new Promise(e=>setTimeout(e,600))}return!0}catch(e){if(O=null,e.name===`NotFoundError`)return!1;throw e}}function W(e,t){let r=(t||e.customer_phone||``).replace(/[^0-9]/g,``);r.startsWith(`0`)&&(r=`62`+r.substring(1));let o=i(e.items).map((e,t)=>{if(e.type===`bundle`){let r=e.items.map((e,t)=>{let r=n(e.variant_label),i=r&&r!==`Default`&&r!==`Standar`&&r!==`Standard`?` (${r})`:``;return`   ITEM ${t+1}: ${e.product_name}${i} (${e.unit_qty}x = Rp ${s(e.discounted_line_price)})`}).join(`
`);return`${t+1}. *${e.bundleName}* (${e.bundleQty}x)\n${r}\n   Total Paket: Rp ${s(e.totalDiscounted)}`}let r=e.item,i=n(r.variant_label),a=i?` (${i})`:``;return`${t+1}. *${r.product_name}*${a}\n   ${r.quantity}x @ Rp ${s(r.price)} = Rp ${s(r.subtotal)}${r.custom_notes&&!/^Bundling:/i.test(r.custom_notes)?`\n   _${r.custom_notes}_`:``}`}).join(`

`),c=`*${e.store_name.toUpperCase()}*\n`;c+=`_${e.tagline||`Specialty Coffee Roastery`}_\n`,c+=`========================================
`,c+=`*STRUK PEMBELIAN*
`,c+=`========================================
`,c+=`No. Struk : #${e.order_number}\n`,c+=`Tanggal   : ${e.date}\n`,c+=`Kasir     : ${e.cashier_name}\n`,e.customer_name&&e.customer_name!==`Pelanggan Kasir`&&(c+=`Pelanggan : ${e.customer_name}\n`),e.customer_phone&&e.customer_phone!==`-`&&(c+=`Telepon   : ${e.customer_phone}\n`),e.customer_address&&e.customer_address!==`Toko Fisik / POS Kasir`&&(c+=`Alamat    : ${e.customer_address}\n`),e.shipping_courier&&(e.shipping_cost||0)>0&&(c+=`Ekspedisi : ${e.shipping_courier}\n`),c+=`----------------------------------------
`,c+=`*RINCIAN PESANAN:*

`,c+=`${o}\n`,c+=`----------------------------------------
`,c+=`Subtotal  : Rp ${s(e.subtotal)}\n`,e.discount_amount>0&&(c+=`Diskon    : -Rp ${s(e.discount_amount)}\n`),e.shipping_cost&&e.shipping_cost>0&&(c+=`Ongkir    : Rp ${s(e.shipping_cost)}\n`);let l=a(e.items);l&&(c+=`Total Full: Rp ${s(l.totalFull)}\n`,c+=`DP (${l.dpPercentLabel}) : Rp ${s(l.dpPaid)}\n`,c+=`Sisa Bayar: Rp ${s(l.dpRemaining)}\n`),c+=`*TOTAL    : Rp ${s(e.total_amount)}*\n`,c+=`Metode    : ${e.payment_method_label}\n`,e.cash_tendered&&e.cash_tendered>0&&(c+=`Tunai     : Rp ${s(e.cash_tendered)}\n`,c+=`Kembalian : Rp ${s(e.cash_change||0)}\n`),c+=`----------------------------------------
`,c+=`${e.footer_note||`Terima kasih telah berbelanja di Alat Kopi Malang!`}\n`,e.instagram&&(c+=`\nInstagram: https://instagram.com/${e.instagram.replace(`@`,``)}\n`);let u=encodeURIComponent(c);return r?`https://wa.me/${r}?text=${u}`:`https://wa.me/?text=${u}`}function G(e,t=`58mm`){let n=t===`80mm`?42:32,r=`-`.repeat(n),i=`=`.repeat(n),a=[];a.push(c(e.store_name.toUpperCase(),n)),a.push(c(`RINGKASAN PENJUALAN POS`,n)),a.push(i),a.push(l(`Periode:`,e.period_title,n)),a.push(l(`Dicetak:`,e.printed_at,n)),a.push(l(`Kasir:`,e.cashier_name,n)),a.push(r),a.push(l(`Total Transaksi`,`${e.total_transactions} Trx`,n)),a.push(l(`Total Omset`,`Rp ${s(e.total_revenue)}`,n)),a.push(l(`Rata-rata/Trx`,`Rp ${s(e.average_order_value)}`,n)),a.push(r),a.push(c(`METODE PEMBAYARAN`,n));for(let t of e.payment_breakdown)a.push(l(`${t.label} (${t.count})`,`Rp ${s(t.total)}`,n));if(a.push(r),e.cash_drawer&&(a.push(c(`ARUS KAS TUNAI LACI`,n)),a.push(l(`Penjualan Tunai`,`+Rp ${s(e.cash_drawer.cash_sales)}`,n)),a.push(l(`Kas Masuk Lain`,`+Rp ${s(e.cash_drawer.cash_in)}`,n)),a.push(l(`Kas Keluar Toko`,`-Rp ${s(e.cash_drawer.cash_out)}`,n)),a.push(l(`TOTAL KAS DI LACI`,`Rp ${s(e.cash_drawer.net_cash)}`,n)),a.push(r)),e.top_products&&e.top_products.length>0){a.push(c(`PRODUK TERLARIS`,n));for(let t of e.top_products.slice(0,5))a.push(t.name.length>n?t.name.substring(0,n):t.name),a.push(l(`  ${t.quantity}x (${t.variant})`,`Rp ${s(t.total)}`,n));a.push(r)}return a.push(i),a.push(c(`LAPORAN RESMI POS SANUBARI`,n)),a.join(`
`)}function K(e,t=`58mm`){let n=G(e,t),r=t===`80mm`?`76mm`:`48mm`,i=t===`80mm`?`80mm auto`:`58mm auto`;f(`
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
    `,n,1,!1,t)}function q(e,t=`58mm`,n){let r=n?.receipt_columns||(t===`80mm`?42:32),i=`-`.repeat(r),a=`=`.repeat(r),o=[];if(o.push(c(e.store_name.toUpperCase(),r)),o.push(c(`LAPORAN LABA RUGI (P&L)`,r)),o.push(a),o.push(l(`Periode:`,e.period_title,r)),o.push(l(`Dicetak:`,e.printed_at,r)),o.push(l(`Kasir:`,e.cashier_name,r)),o.push(i),o.push(c(`1. PENDAPATAN PENJUALAN`,r)),o.push(l(`Total Transaksi`,`${e.total_transactions} Trx`,r)),o.push(l(`Barang Terjual`,`${e.items_sold} Item`,r)),o.push(l(`Penjualan Kotor`,`Rp ${s(e.gross_sales)}`,r)),e.total_discounts>0&&o.push(l(`Diskon Penjualan`,`-Rp ${s(e.total_discounts)}`,r)),o.push(l(`PENJUALAN BERSIH`,`Rp ${s(e.net_sales)}`,r)),o.push(i),o.push(c(`2. HARGA POKOK PENJUALAN`,r)),o.push(l(`Total HPP (COGS)`,`-Rp ${s(e.total_cogs)}`,r)),o.push(i),o.push(c(`3. LABA KOTOR (GROSS)`,r)),o.push(l(`Laba Kotor`,`Rp ${s(e.gross_profit)}`,r)),o.push(l(`Gross Margin`,`${e.gross_margin_pct}%`,r)),o.push(i),e.total_expenses>0||e.expense_breakdown&&e.expense_breakdown.length>0){if(o.push(c(`4. BEBAN KAS OPERASIONAL`,r)),e.expense_breakdown)for(let t of e.expense_breakdown)o.push(l(`- ${t.label}`,`-Rp ${s(t.total)}`,r));o.push(l(`TOTAL BEBAN KAS`,`-Rp ${s(e.total_expenses)}`,r)),o.push(i)}e.other_income>0&&(o.push(l(`Pendapatan Lain`,`+Rp ${s(e.other_income)}`,r)),o.push(i)),o.push(a),o.push(l(`LABA BERSIH (NET)`,`Rp ${s(e.net_profit)}`,r)),o.push(l(`Net Profit Margin`,`${e.net_margin_pct}%`,r)),o.push(a),o.push(c(`ALAT KOPI MALANG POS`,r));let u=n?.margin_feed_lines||2;for(let e=0;e<u;e++)o.push(``);return o.join(`
`)}function J(e,t=`58mm`,n){let r=q(e,t,n),i=t===`80mm`?`76mm`:`48mm`,a=t===`80mm`?`80mm auto`:`58mm auto`,o=n?.margin_horizontal||`1mm`;f(`
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
    `,r,1,!1,t)}function Y(e){let t=e.items.map((e,t)=>{let r=n(e.variant_label),i=r?` (${r})`:``;return`${t+1}. *${e.product_name}*${i}\n   ${e.quantity}x @ Rp ${s(e.price)} = Rp ${s(e.subtotal)}${e.custom_notes&&!/^Bundling:/i.test(e.custom_notes)?`\n   _${e.custom_notes}_`:``}`}).join(`

`),r=`*${e.store_name.toUpperCase()}*\n`;return e.tagline&&(r+=`_${e.tagline}_\n`),r+=`========================================
`,r+=`*ESTIMASI PESANAN (PRE-BILL)*
`,r+=`========================================
`,r+=`Status    : Menunggu Pembayaran
`,r+=`Waktu     : ${e.date}\n`,r+=`Kasir     : ${e.cashier_name}\n`,e.customer_name&&e.customer_name.trim()&&(r+=`Pelanggan : ${e.customer_name.trim()}\n`),e.customer_phone&&e.customer_phone.trim()&&(r+=`Telepon   : ${e.customer_phone.trim()}\n`),e.customer_address&&e.customer_address.trim()&&(r+=`Alamat    : ${e.customer_address.trim()}\n`),e.shipping_courier&&(e.shipping_cost||0)>0&&(r+=`Ekspedisi : ${e.shipping_courier.trim()}\n`),e.notes&&e.notes.trim()&&(r+=`Catatan   : ${e.notes.trim()}\n`),r+=`----------------------------------------
`,r+=`*RINCIAN PESANAN:*

`,r+=`${t}\n`,r+=`----------------------------------------
`,r+=`Subtotal  : Rp ${s(e.subtotal)}\n`,e.discount_amount>0&&(r+=`Diskon    : -Rp ${s(e.discount_amount)}\n`),e.shipping_cost&&e.shipping_cost>0&&(r+=`Ongkir    : Rp ${s(e.shipping_cost)}\n`),r+=`*TOTAL TAGIHAN : Rp ${s(e.total_amount)}*\n`,r+=`----------------------------------------
`,(e.bank_info||e.qris_instructions)&&(r+=`*Informasi Pembayaran:*
`,e.bank_info&&(r+=`- Rekening: ${e.bank_info}\n`),e.qris_instructions&&(r+=`- QRIS: ${e.qris_instructions}\n`),r+=`----------------------------------------
`),r+=`Silakan konfirmasi pesanan ini atau lakukan pembayaran di kasir / transfer bank.
Terima kasih!
`,e.instagram&&(r+=`\nInstagram: https://instagram.com/${e.instagram.replace(`@`,``)}\n`),r}function X(e,t){let n=(t||e.customer_phone||``).replace(/[^0-9]/g,``);n.startsWith(`0`)&&(n=`62`+n.substring(1));let r=Y(e),i=encodeURIComponent(r);return n?`https://wa.me/${n}?text=${i}`:`https://wa.me/?text=${i}`}function Z(e,t=`58mm`){let r=t===`80mm`?42:32,i=`-`.repeat(r),a=`=`.repeat(r),o=[];o.push(c(e.store_name.toUpperCase(),r)),e.tagline&&o.push(c(e.tagline,r)),e.address&&o.push(c(e.address,r)),e.phone&&o.push(c(`Telp/WA: ${e.phone}`,r)),o.push(a),o.push(c(`ESTIMASI PESANAN (PRE-BILL)`,r)),o.push(c(`** BELUM DIBAYAR **`,r)),o.push(i),o.push(l(`Waktu:`,e.date,r)),o.push(l(`Kasir:`,e.cashier_name,r)),e.customer_name&&o.push(l(`Pelanggan:`,e.customer_name,r)),e.customer_phone&&o.push(l(`Telp/WA:`,e.customer_phone,r)),e.customer_address&&o.push(`Alamat: ${e.customer_address}`),o.push(i);for(let t of e.items){let e=t.product_name.length>r?t.product_name.substring(0,r):t.product_name;o.push(e);let i=n(t.variant_label),a=i?`  ${t.quantity}x @${s(t.price)} (${i})`:`  ${t.quantity}x @${s(t.price)}`,c=`Rp ${s(t.subtotal)}`;o.push(l(a,c,r))}if(o.push(i),o.push(l(`Subtotal`,`Rp ${s(e.subtotal)}`,r)),e.discount_amount>0&&o.push(l(`Diskon`,`-Rp ${s(e.discount_amount)}`,r)),e.shipping_cost&&e.shipping_cost>0){let t=e.shipping_courier?` (${e.shipping_courier})`:``;o.push(l(`Ongkir${t}`,`Rp ${s(e.shipping_cost)}`,r))}return o.push(a),o.push(l(`TOTAL TAGIHAN`,`Rp ${s(e.total_amount)}`,r)),o.push(i),e.bank_info&&(o.push(c(`PEMBAYARAN TRANSFER:`,r)),o.push(c(e.bank_info,r)),o.push(i)),o.push(c(`Silakan lakukan pembayaran di kasir`,r)),o.push(c(`Terima kasih!`,r)),o.join(`
`)}function Q(e,t=`58mm`){let n=Z(e,t);f(`
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
    `,n,1,!1,t)}function $(e){let t=595.28,r=841.89,o=553.28,c=e=>(e||``).replace(/[•★]/g,`*`).replace(/[—–]/g,`-`).replace(/[“”]/g,`"`).replace(/[‘’]/g,`'`).replace(/[^\x20-\x7E]/g,``).replace(/\\/g,`\\\\`).replace(/\(/g,`\\(`).replace(/\)/g,`\\)`),l=(e,t)=>{let n=(e||``).trim();return n.length<=t?n:n.slice(0,t-3)+`...`},u=(e,t)=>{let n=(e||``).replace(/\s+/g,` `).trim();if(!n)return[];let r=n.split(` `),i=[],a=``;for(let e of r)a?(a+` `+e).length<=t?a+=` `+e:(i.push(a),a=e):a=e;return a&&i.push(a),i},d=(e,t,n)=>{let r=(e||``).replace(/[^\x20-\x7E]/g,``);if(t===`F4`)return r.length*n*.6;let i=t===`F2`?.55:.51,a=0;for(let e=0;e<r.length;e++){let t=r[e];`ilI1.,:;!| '()`.includes(t)?a+=n*.28:`MW@%mw`.includes(t)?a+=n*.78:a+=t>=`A`&&t<=`Z`?n*(i+.09):n*i}return a},f=(e,t,n,i,a,o)=>{let s=r-t;return`BT /${i} ${a.toFixed(2)} Tf ${o[0].toFixed(3)} ${o[1].toFixed(3)} ${o[2].toFixed(3)} rg ${e.toFixed(2)} ${s.toFixed(2)} Td (${c(n)}) Tj ET`},p=(e,t,n,r,i,a)=>{let o=d(n,r,i);return f(Math.max(12,e-o),t,n,r,i,a)},m=(e,t,n,r,i,a,o)=>{let s=d(r,i,a);return f(e+Math.max(0,(t-s)/2),n,r,i,a,o)},h=(e,t,n,i,a,o,s=1)=>{let c=r-(t+i),l=[`q`];a&&l.push(`${a[0].toFixed(3)} ${a[1].toFixed(3)} ${a[2].toFixed(3)} rg`),o&&l.push(`${o[0].toFixed(3)} ${o[1].toFixed(3)} ${o[2].toFixed(3)} RG ${s.toFixed(2)} w`);let u=a&&o?`B`:a?`f`:`S`;return l.push(`${e.toFixed(2)} ${c.toFixed(2)} ${n.toFixed(2)} ${i.toFixed(2)} re ${u} Q`),l.join(` `)},g=(e,t,n,i,a,o=1)=>{let s=r-t,c=r-i;return`q ${a[0].toFixed(3)} ${a[1].toFixed(3)} ${a[2].toFixed(3)} RG ${o.toFixed(2)} w ${e.toFixed(2)} ${s.toFixed(2)} m ${n.toFixed(2)} ${c.toFixed(2)} l S Q`},_=(e.store_name||`ALAT KOPI MALANG`).toUpperCase(),v=e.tagline||`Close to Your Every Brew`,y=e.address||`Ruko Tlogomas Square Kav. 34, Jl. Raya Tlogomas, Lowokwaru, Kota Malang`,b=e.phone||`+6282132095241`,x=e.date||``,S=e.cashier_name||`Kasir Sanubari`,C=(e.customer_name||``).trim()||`Pelanggan Sanubari`,w=!!(e.notes&&e.notes.toLowerCase().includes(`no. struk:`)),T=[];T.push(h(0,0,t,r,[1,1,1],null)),T.push(f(42,58,_,`F2`,17,[.067,.094,.153])),T.push(f(42,73,v,`F3`,9.5,[.294,.333,.388]));let E=88;for(let e of u(y,58))T.push(f(42,E,e,`F1`,8.5,[.42,.447,.502])),E+=12;T.push(f(42,E,`Telp/WA: ${b}`,`F1`,8.5,[.42,.447,.502]));let D=387.28;T.push(h(D,44,166,18,[.925,.992,.961],[.655,.953,.816],.8)),T.push(m(D,166,56,`FAKTUR PENJUALAN DIGITAL (A4)`,`F2`,8,[.024,.373,.275])),T.push(p(o,76,`Waktu: ${x} WIB`,`F2`,9.5,[.067,.094,.153])),T.push(p(o,90,`Kasir: ${S}`,`F1`,9,[.294,.333,.388]));let O=w?`LUNAS (PAID)`:`ESTIMASI (PRE-BILL)`,k=w?86:112,A=o-k;w?(T.push(h(A,97,k,16,[.82,.98,.898],[.431,.906,.718],.8)),T.push(m(A,k,108,O,`F2`,8,[.024,.373,.275]))):(T.push(h(A,97,k,16,[.996,.953,.78],[.992,.902,.541],.8)),T.push(m(A,k,108,O,`F2`,8,[.471,.208,.059])));let j=Math.max(E+14,124);T.push(g(42,j,o,j,[.067,.094,.153],1.8));let M=j+18;T.push(f(42,M,`DITUJUKAN KEPADA:`,`F2`,8,[.612,.639,.686])),T.push(f(42,M+15,C,`F2`,12.5,[.067,.094,.153]));let N=M+29;if(e.customer_phone&&e.customer_phone!==`-`&&(T.push(f(42,N,`No. WhatsApp: ${e.customer_phone}`,`F1`,9,[.294,.333,.388])),N+=13),e.customer_address&&e.customer_address!==`Toko Fisik / POS Kasir`)for(let t of u(`Alamat Kirim: ${e.customer_address}`,56))T.push(f(42,N,t,`F1`,8.5,[.216,.255,.318])),N+=12;if(e.shipping_courier&&(e.shipping_cost||0)>0&&(T.push(f(42,N,`Ekspedisi: ${e.shipping_courier}`,`F1`,8.5,[.294,.333,.388])),N+=12),e.notes)for(let t of u(`Catatan: ${e.notes}`,60))T.push(f(42,N,t,`F3`,8.5,[.42,.447,.502])),N+=12;T.push(p(o,M,`STATUS DOKUMEN:`,`F2`,8,[.612,.639,.686])),T.push(p(o,M+14,w?`PEMBAYARAN LUNAS`:`MENUNGGU PEMBAYARAN`,`F2`,9.5,w?[.024,.373,.275]:[.573,.251,.055])),T.push(p(o,M+27,`POS Cashier Digital Invoice`,`F1`,8.5,[.42,.447,.502]));let P=Math.max(N+12,M+46),F=398.28,I=549.28;T.push(m(42,28,P,`NO`,`F2`,8,[.294,.333,.388])),T.push(f(76,P,`DESKRIPSI PRODUK & VARIAN`,`F2`,8,[.294,.333,.388])),T.push(p(F,P,`HARGA`,`F2`,8,[.294,.333,.388])),T.push(m(423.28,40,P,`QTY`,`F2`,8,[.294,.333,.388])),T.push(p(I,P,`JUMLAH (IDR)`,`F2`,8,[.294,.333,.388]));let L=P+8;T.push(g(42,L,o,L,[.82,.835,.859],1.3));let R=i(e.items);for(let e=0;e<R.length&&!(L>651.89);e++){let t=R[e];if(t.type===`bundle`){let r=u(t.bundleName,44),i=L+14;for(let e of r)T.push(f(76,i,e,`F2`,10,[.067,.094,.153])),i+=12;let a=i+1;t.items.forEach((e,t)=>{let r=n(e.variant_label),i=!!r,o=`ITEM ${t+1}: ${e.product_name}${i?` (${r})`:``} (${e.unit_qty}x @ Rp ${s(e.discounted_line_price)})`,c=u(o,58);for(let e of c)T.push(f(76,a,e,`F1`,8,[.35,.38,.44])),a+=10}),T.push(m(42,28,L+14,String(e+1),`F4`,9,[.42,.447,.502])),T.push(p(F,L+14,`Rp ${s(Math.round(t.totalDiscounted/t.bundleQty))}`,`F1`,9.5,[.216,.255,.318])),T.push(m(423.28,40,L+14,`${t.bundleQty}x`,`F2`,9.5,[.067,.094,.153])),T.push(p(I,L+14,`Rp ${s(t.totalDiscounted)}`,`F2`,9.5,[.067,.094,.153])),L=Math.max(L+30,a+4),T.push(g(42,L,o,L,[.898,.906,.922],.7));continue}let r=t.item,i=u(r.product_name,44),a=L+14;for(let e of i)T.push(f(76,a,e,`F2`,10,[.067,.094,.153])),a+=12;let c=n(r.variant_label);if(c){let e=u(`Varian: ${c}`,48);for(let t of e)T.push(f(76,a,t,`F1`,8.5,[.42,.447,.502])),a+=11}let l=a;if(r.custom_notes&&!/^Bundling:/i.test(r.custom_notes)){let e=u(r.custom_notes,54);for(let t of e)T.push(f(76,l,t,`F1`,7.8,[.012,.412,.631])),l+=10}T.push(m(42,28,L+14,String(e+1),`F4`,9,[.42,.447,.502])),T.push(p(F,L+14,`Rp ${s(r.price)}`,`F1`,9.5,[.216,.255,.318])),T.push(m(423.28,40,L+14,String(r.quantity),`F2`,9.5,[.067,.094,.153])),T.push(p(I,L+14,`Rp ${s(r.subtotal)}`,`F2`,9.5,[.067,.094,.153])),L=Math.max(L+30,l+4),T.push(g(42,L,o,L,[.898,.906,.922],.7))}let z=L+18,B=z;if(e.bank_info||e.qris_instructions){let t=[];e.bank_info&&t.push(...u(`Rekening Bank: ${e.bank_info}`,44)),e.qris_instructions&&t.push(...u(`QRIS: ${e.qris_instructions}`,44));let n=26+t.length*13;T.push(h(42,B,281.204,n,[.976,.98,.984],[.898,.906,.922],.8)),T.push(f(52,B+15,`PETUNJUK PEMBAYARAN TRANSFER / QRIS:`,`F2`,8.5,[.024,.373,.275]));let r=B+29;for(let e of t)T.push(f(52,r,e,`F1`,8.5,[.067,.094,.153])),r+=13;B+=n+14}T.push(h(42,B,148,44,[1,1,1],[.122,.161,.216],1.4)),T.push(m(42,148,B+12,`ALAT KOPI MALANG`,`F2`,7,[.42,.447,.502])),T.push(m(42,148,B+26,w?`* RESMI (LUNAS) *`:`* RESMI (PRE-BILL) *`,`F2`,9.5,[.024,.373,.275])),T.push(m(42,148,B+38,`MALANG - ${x}`,`F4`,6.8,[.612,.639,.686]));let V=a(e.items),H=1;V&&(H+=3),e.discount_amount>0&&H++,(e.shipping_cost||0)>0&&H++;let U=46+H*16;T.push(h(348.768,z,204.512,U,[.976,.98,.984],[.898,.906,.922],.8));let W=z+18;if(V&&(T.push(f(360.768,W,`Total Pesanan (Full):`,`F1`,9,[.294,.333,.388])),T.push(p(541.28,W,`Rp ${s(V.totalFull)}`,`F2`,9,[.067,.094,.153])),W+=16,T.push(f(360.768,W,`DP Dibayar (${V.dpPercentLabel}):`,`F2`,9,[.012,.412,.631])),T.push(p(541.28,W,`Rp ${s(V.dpPaid)}`,`F2`,9,[.012,.412,.631])),W+=16,T.push(f(360.768,W,`Sisa Pelunasan:`,`F2`,9,[.706,.325,.035])),T.push(p(541.28,W,`Rp ${s(V.dpRemaining)}`,`F2`,9,[.706,.325,.035])),W+=16),T.push(f(360.768,W,`Subtotal:`,`F1`,9.5,[.294,.333,.388])),T.push(p(541.28,W,`Rp ${s(e.subtotal)}`,`F2`,9.5,[.067,.094,.153])),W+=16,e.discount_amount>0&&(T.push(f(360.768,W,`Potongan Diskon:`,`F1`,9.5,[.016,.471,.341])),T.push(p(541.28,W,`-Rp ${s(e.discount_amount)}`,`F2`,9.5,[.016,.471,.341])),W+=16),(e.shipping_cost||0)>0){let t=`Ongkos Kirim${e.shipping_courier?` (${e.shipping_courier})`:``}:`;T.push(f(360.768,W,l(t,24),`F1`,9.5,[.118,.251,.686])),T.push(p(541.28,W,`Rp ${s(e.shipping_cost||0)}`,`F2`,9.5,[.118,.251,.686])),W+=16}T.push(g(360.768,W-4,541.28,W-4,[.82,.835,.859],1.2)),T.push(f(360.768,W+14,`TOTAL:`,`F2`,10.5,[.067,.094,.153])),T.push(p(541.28,W+15,`Rp ${s(e.total_amount)}`,`F2`,14.5,[.067,.094,.153]));let G=Math.max(B+44+34,z+U+34);T.push(g(42,G,o,G,[.898,.906,.922],.8)),T.push(m(42,511.28,G+16,`Terima kasih telah memesan di Alat Kopi Malang! Dokumen ini adalah faktur digital resmi format A4 yang diterbitkan oleh sistem POS Sanubari.`,`F1`,8,[.612,.639,.686]));let K=T.join(`
`),q=[`<< /Type /Catalog /Pages 2 0 R >>`,`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${t.toFixed(2)} ${r.toFixed(2)}] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R /F4 7 0 R >> >> /Contents 8 0 R >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>`,`<< /Length ${K.length} >>\nstream\n${K}\nendstream`],J=`%PDF-1.4
`,Y=[];for(let e=0;e<q.length;e++)Y.push(J.length),J+=`${e+1} 0 obj\n${q[e]}\nendobj\n`;let X=J.length,Z=q.length+1;J+=`xref\n0 ${Z}\n0000000000 65535 f \n`;for(let e of Y)J+=`${String(e).padStart(10,`0`)} 00000 n \n`;J+=`trailer\n<< /Size ${Z} /Root 1 0 R >>\nstartxref\n${X}\n%%EOF`;let Q=new Uint8Array(J.length);for(let e=0;e<J.length;e++)Q[e]=J.charCodeAt(e)&255;return Q}function ee(e){if(typeof window>`u`)return;let t=`Invoice-Sanubari-Roastery-${(e.customer_name||`Pelanggan`).replace(/[^a-zA-Z0-9_-]/g,`-`).replace(/-+/g,`-`).replace(/^-|-$/g,``)||`Pelanggan`}.pdf`;if((A()||/SanubariPOS-Android|wv|Android/i.test(navigator.userAgent||``))&&navigator.onLine)try{let n=JSON.stringify(e),r=k(new TextEncoder().encode(n)).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``),i=`/pos/download-apk?invoice_pdf=1&payload=${encodeURIComponent(r)}`;if(/SanubariPOS-Android/i.test(navigator.userAgent||``)||A()){window.location.href=i;return}let a=document.createElement(`a`);a.href=i,a.download=t,document.body.appendChild(a),a.click(),document.body.removeChild(a);return}catch{}let n=$(e),r=new Blob([n],{type:`application/pdf`}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=t,a.style.display=`none`,document.body.appendChild(a),a.click(),document.body.removeChild(a),window.setTimeout(()=>{URL.revokeObjectURL(i)},1e4)}export{I as A,K as C,C as D,p as E,B as O,J as S,T,v as _,s as a,ee as b,X as c,P as d,y as f,A as g,i as h,a as i,F as k,V as l,x as m,R as n,u as o,M as p,z as r,Y as s,n as t,W as u,j as v,U as w,Q as x,L as y};