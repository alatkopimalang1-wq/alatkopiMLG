function e(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}function t(e){return e?e.replace(/\s*\(1\s*kg\s*custom[^)]*\)/gi,``).trim():``}function n(e){if(e.bundle_name&&e.bundle_name.trim())return e.bundle_name.trim();if(e.custom_notes){let t=e.custom_notes.match(/^Bundling:\s*(.+?)(?:\s*\(Diskon:.*\))?$/i);if(t&&t[1])return t[1].trim()}return null}function r(e){let t=[],r=new Map;for(let i of e){let e=n(i);if(!e){t.push({type:`single`,item:i});continue}let a=i.bundle_id?`id:${i.bundle_id}`:`name:${e}`,o=i.bundle_unit_qty&&i.bundle_unit_qty>0?i.bundle_unit_qty:1,s=Math.max(1,Math.round(i.quantity/o)),c=i.price*i.quantity,l=i.subtotal??Math.max(0,c-(i.discount_amount||0)),u=i.price*o,d=Math.round(l/s),f=r.get(a);if(f!==void 0){let e=t[f];e.type===`bundle`&&(e.totalNormal+=c,e.totalDiscounted+=l,e.items.push({product_name:i.product_name,variant_label:i.variant_label,unit_qty:o,normal_line_price:u,discounted_line_price:d}))}else r.set(a,t.length),t.push({type:`bundle`,bundleName:e,bundleQty:s,totalNormal:c,totalDiscounted:l,items:[{product_name:i.product_name,variant_label:i.variant_label,unit_qty:o,normal_line_price:u,discounted_line_price:d}]})}return t}function i(e){let t=0,n=0,r=0,i=!1,a=``,o=0;for(let s of e){if(!s.custom_notes)continue;let e=s.custom_notes.match(/Total:\s*Rp\s*([\d.]+)\s*\|\s*DP\s*\(([^)]+)\):\s*Rp\s*([\d.]+)\s*\|\s*Sisa:\s*Rp\s*([\d.]+)/i);if(e){i=!0,o++;let s=e=>Number(e.replace(/\./g,``))||0;t+=s(e[1]),a=e[2],n+=s(e[3]),r+=s(e[4])}}if(!i)return null;let s=t>0?n/t*100:0,c=o===1&&a?a:`${Number.isInteger(s)?s:s.toFixed(1).replace(/\.0$/,``)}%`;return{totalFull:t,dpPaid:n,dpRemaining:r,dpPercentLabel:c}}function a(n,a={}){let s=(a.paper_width||`80mm`)===`80mm`||a.custom_paper_width_mm&&a.custom_paper_width_mm>=75,c=s?`11px`:`9.5px`,l=s?`14px`:`12px`,u=s?`14px`:`12px`,d=a.font_family||`sans-serif`,f=`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Plus Jakarta Sans', Helvetica, Arial, sans-serif`;d===`consolas`||d===`monospace`?f=`'Consolas', 'Courier New', monospace`:d===`courier`?f=`'Courier New', Courier, monospace`:d===`roboto-mono`&&(f=`'Roboto Mono', monospace`);let p=r(n.items).map(n=>{if(n.type===`bundle`){let r=n.items.map((n,r)=>{let i=t(n.variant_label),a=i&&i!==`Standard`&&i!==`Standar`;return`
                            <tr>
                                <td colspan="2" style="padding-left: 6px; padding-top: 2px; font-size: 9.5px; color: #555; font-weight: 700;">
                                    ITEM ${r+1}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-left: 6px; font-size: ${c}; color: #111;">
                                    ${e(n.product_name)}${a?` (${e(i)})`:``}
                                </td>
                                <td style="text-align: right; white-space: nowrap; font-weight: 700; font-size: ${c}; color: #000;">
                                    ${n.unit_qty}x Rp ${o(n.discounted_line_price)}
                                </td>
                            </tr>
                        `}).join(``);return`
                    <tr>
                        <td colspan="2" style="font-weight: 800; padding-top: 5px; font-size: ${c}; color: #000;">
                            ${e(n.bundleName)}
                        </td>
                    </tr>
                    ${r}
                    <tr>
                        <td style="font-weight: 700; padding-top: 3px; padding-bottom: 5px; font-size: ${c}; color: #000; border-bottom: 1px dashed #ccc;">
                            Total Harga Paket (${n.bundleQty}x)
                        </td>
                        <td style="text-align: right; font-weight: 800; padding-top: 3px; padding-bottom: 5px; white-space: nowrap; font-size: ${c}; color: #000; border-bottom: 1px dashed #ccc;">
                            Rp ${o(n.totalDiscounted)}
                        </td>
                    </tr>
                `}let r=n.item,i=r.variant_label?` (${e(t(r.variant_label))})`:``;return`
            <tr>
                <td colspan="2" style="font-weight: 700; padding-top: 4px; font-size: ${c}; color: #000; line-height: 1.3;">
                    ${e(r.product_name)}${i}
                </td>
            </tr>
            <tr>
                <td style="text-align: left; padding-left: 4px; padding-bottom: 4px; font-size: ${c}; color: #222;">
                    ${r.quantity} x Rp ${o(r.price)}
                </td>
                <td style="text-align: right; font-weight: 700; padding-bottom: 4px; white-space: nowrap; font-size: ${c}; color: #000; font-variant-numeric: tabular-nums;">
                    Rp ${o(r.subtotal)}
                </td>
            </tr>
            ${r.custom_notes&&!/^Bundling:/i.test(r.custom_notes)?`
            <tr>
                <td colspan="2" style="padding-left: 6px; padding-bottom: 4px; font-size: 9.5px; color: #333; line-height: 1.3;">
                    ${e(r.custom_notes)}
                </td>
            </tr>
            `:``}
        `}).join(``);return`
    <div class="sanubari-receipt-body" style="width: 100%; box-sizing: border-box; color: #000000; font-family: ${f}; font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 8px;">
            ${a.show_logo===!1?``:`<div style="font-weight: 900; font-size: ${l}; letter-spacing: 1px; text-transform: uppercase;">ALAT KOPI MALANG</div>`}
            <div style="font-size: ${l}; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">
                ${e(n.store_name||`Alat Kopi Malang`)}
            </div>
            ${n.tagline?`<div style="font-size: 10px; font-style: italic; color: #333; margin-top: 1px;">${e(n.tagline)}</div>`:``}
            ${n.address?`<div style="font-size: 9.5px; line-height: 1.3; color: #333; margin-top: 2px;">${e(n.address)}</div>`:``}
            ${n.phone?`<div style="font-size: 9.5px; color: #333;">WA: ${e(n.phone)}</div>`:``}
        </div>

        <div style="border-bottom: 1.5px dashed #000000; margin: 6px 0;"></div>

        <!-- Refund Notice -->
        ${n.is_refund?`
            <div style="text-align: center; font-weight: 900; font-size: ${c}; margin: 4px 0;">
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
            ${p}
        </table>

        <div style="border-bottom: 1px dashed #000000; margin: 6px 0;"></div>

        <!-- Totals -->
        <table style="width: 100%; font-size: ${c}; border-collapse: collapse; color: #000; font-variant-numeric: tabular-nums;">
            ${(()=>{let t=i(n.items);return t?`
            <tr>
                <td style="text-align: left; padding: 2px 0;">Total Pesanan (Full)</td>
                <td style="text-align: right; white-space: nowrap; font-weight: 700;">Rp ${o(t.totalFull)}</td>
            </tr>
            <tr>
                <td style="text-align: left; padding: 2px 0; font-weight: 700;">DP Dibayar (${e(t.dpPercentLabel)})</td>
                <td style="text-align: right; white-space: nowrap; font-weight: 700;">Rp ${o(t.dpPaid)}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #999;">
                <td style="text-align: left; padding: 2px 0 4px; font-weight: 700;">Sisa Pelunasan</td>
                <td style="text-align: right; white-space: nowrap; font-weight: 700; padding-bottom: 4px;">Rp ${o(t.dpRemaining)}</td>
            </tr>
            `:``})()}
            <tr>
                <td style="text-align: left; padding: 2px 0;">Subtotal</td>
                <td style="text-align: right; white-space: nowrap; font-weight: 700;">Rp ${o(n.subtotal)}</td>
            </tr>
            ${n.discount_amount>0?`
            <tr>
                <td style="text-align: left; padding: 2px 0; font-weight: 700;">Diskon</td>
                <td style="text-align: right; font-weight: 700; white-space: nowrap;">-Rp ${o(n.discount_amount)}</td>
            </tr>
            `:``}
            ${n.shipping_cost&&n.shipping_cost>0?`
            <tr>
                <td style="text-align: left; padding: 2px 0;">Ongkir (${e(n.shipping_courier||`Kurir`)})</td>
                <td style="text-align: right; white-space: nowrap;">Rp ${o(n.shipping_cost)}</td>
            </tr>
            `:``}
            <tr style="border-top: 1.5px dashed #000000;">
                <td style="text-align: left; font-weight: 900; font-size: ${u}; padding: 5px 0;">TOTAL</td>
                <td style="text-align: right; font-weight: 900; font-size: ${u}; padding: 5px 0; white-space: nowrap;">
                    Rp ${o(n.total_amount)}
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
                <td style="text-align: right; white-space: nowrap;">Rp ${o(n.cash_tendered)}</td>
            </tr>
            <tr>
                <td style="text-align: left; padding: 2px 0; font-weight: 700;">Kembalian</td>
                <td style="text-align: right; font-weight: 700; white-space: nowrap;">Rp ${o(n.cash_change||0)}</td>
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
    `}function o(e){let t=typeof e==`number`&&!isNaN(e)?e:0;return new Intl.NumberFormat(`id-ID`).format(t)}function s(e,t){if(e.length>=t)return e.substring(0,t);let n=Math.floor((t-e.length)/2),r=t-e.length-n;return` `.repeat(n)+e+` `.repeat(r)}function c(e,t,n){let r=Math.max(1,n-e.length-t.length);return e+` `.repeat(r)+t}function l(e,n=`58mm`){let a=typeof n==`string`?{paper_width:n}:n||{},l=a.paper_width||`58mm`,u=l===`custom`,d=Number(a.receipt_columns)||(u?Number(a.custom_receipt_columns)||40:l===`80mm`?Number(a.receipt_columns_80mm)||44:Number(a.receipt_columns_58mm)||32),f=Number(a.max_item_name_length)||(d>=44?Math.min(d-12,34):d>=38?26:Math.min(d-10,22)),p=a.show_logo??!0,m=Number(a.margin_feed_lines)??2,h=`-`.repeat(d),g=`=`.repeat(d),_=[];p&&_.push(s(`*** ALAT KOPI MALANG ***`,d)),_.push(s(e.store_name.toUpperCase(),d)),e.tagline&&_.push(s(e.tagline,d)),e.address&&_.push(s(e.address,d)),e.phone&&_.push(s(`WA: ${e.phone}`,d)),_.push(g),e.is_refund&&(_.push(s(`*** BUKTI REFUND / RETUR ***`,d)),_.push(s(`DANA TELAH DIKEMBALIKAN`,d)),e.refund_reason&&_.push(c(`Alasan: ${e.refund_reason}`,``,d)),_.push(g)),_.push(c(`No: #${e.order_number}`,``,d)),_.push(c(`Tgl: ${e.date}`,`Kasir: ${e.cashier_name}`,d)),e.customer_name&&e.customer_name!==`Pelanggan Kasir`&&_.push(c(`Pelanggan: ${e.customer_name}`,``,d)),e.customer_phone&&e.customer_phone!==`-`&&_.push(c(`Telp/WA: ${e.customer_phone}`,``,d)),e.customer_address&&e.customer_address!==`Toko Fisik / POS Kasir`&&_.push(`Alamat: ${e.customer_address}`),_.push(h);for(let n of r(e.items)){if(n.type===`bundle`){_.push(n.bundleName.substring(0,d)),n.items.forEach((e,n)=>{let r=t(e.variant_label),i=r&&r!==`Standard`&&r!==`Standar`;_.push(`  ITEM ${n+1}: ${e.product_name}${i?` (${r})`:``}`.substring(0,d)),_.push(c(`    ${e.unit_qty}x`,o(e.discounted_line_price),d))}),_.push(c(`Total Paket (${n.bundleQty}x)`,o(n.totalDiscounted),d));continue}let e=n.item,r=`${e.product_name} (${t(e.variant_label)})`,i=Math.min(f,d);if(r.length<=i)_.push(r);else{let e=r;for(;e.length>0;){if(e.length<=i){_.push(e);break}let t=e.lastIndexOf(` `,i);t<=0&&(t=i),_.push(e.substring(0,t)),e=e.substring(t).trim()}}let a=`  ${e.quantity}x ${o(e.price)}`,s=o(e.subtotal);if(_.push(c(a,s,d)),e.custom_notes&&!/^Bundling:/i.test(e.custom_notes)){let t=e.custom_notes.trim(),n=Math.max(12,d-2);for(;t.length>0;){if(t.length<=n){_.push(`  ${t}`);break}let e=t.lastIndexOf(` `,n);e<=0&&(e=n),_.push(`  ${t.substring(0,e)}`),t=t.substring(e).trim()}}}_.push(h);let v=i(e.items);if(v&&(_.push(c(`Total Pesanan`,`Rp ${o(v.totalFull)}`,d)),_.push(c(`DP (${v.dpPercentLabel})`,`Rp ${o(v.dpPaid)}`,d)),_.push(c(`Sisa Pelunasan`,`Rp ${o(v.dpRemaining)}`,d)),_.push(h)),_.push(c(`Subtotal`,`Rp ${o(e.subtotal)}`,d)),e.discount_amount>0&&_.push(c(`Diskon`,`-Rp ${o(e.discount_amount)}`,d)),e.shipping_cost&&e.shipping_cost>0){let t=e.shipping_courier?` (${e.shipping_courier})`:``;_.push(c(`Ongkir${t}`,`Rp ${o(e.shipping_cost)}`,d))}_.push(c(`TOTAL`,`Rp ${o(e.total_amount)}`,d)),_.push(h),e.is_refund&&(_.push(c(`TOTAL REFUND`,`Rp ${o(e.refund_amount||e.total_amount)}`,d)),_.push(c(`Status Kasir`,`SUDAH DI-REFUND`,d)),_.push(h)),_.push(c(`Metode Bayar`,e.payment_method_label,d)),e.cash_tendered&&e.cash_tendered>0&&(_.push(c(`Bayar Tunai`,`Rp ${o(e.cash_tendered)}`,d)),_.push(c(`Kembalian`,`Rp ${o(e.cash_change||0)}`,d))),_.push(g),e.footer_note&&e.footer_note.split(`
`).forEach(e=>_.push(s(e,d))),e.instagram&&_.push(s(`IG: ${e.instagram}`,d));for(let e=0;e<m;e++)_.push(``);return _.join(`
`)}function u(e,t=!1,n=`58mm`){let r=new TextEncoder().encode(e+`


`),i=new Uint8Array([27,64]),a=t?new Uint8Array([27,112,0,25,250]):new Uint8Array([]),o=n===`80mm`?new Uint8Array([29,86,0]):new Uint8Array([]),s=new Uint8Array(i.length+a.length+r.length+o.length),c=0;return s.set(i,c),c+=i.length,a.length>0&&(s.set(a,c),c+=a.length),s.set(r,c),c+=r.length,o.length>0&&(s.set(o,c),c+=o.length),s}function d(e,t,n=1,r=!1,i=`58mm`,a){if(typeof window>`u`||typeof document>`u`)return;let o=window.electronAPI;if(o&&typeof o.printReceipt==`function`){(async()=>{let n=`sanubari-pos-direct-print-root`,r=`sanubari-pos-direct-print-style`,s=document.getElementById(n);s&&s.parentNode&&s.parentNode.removeChild(s);let c=document.getElementById(r);c&&c.parentNode&&c.parentNode.removeChild(c);let l=i===`custom`||a?.paper_width===`custom`,u=Math.max(30,Math.min(120,Number(a?.custom_paper_width_mm)||58)),d=Math.max(20,Math.min(u,Number(a?.custom_printable_width_mm)||u-4)),f=l?`${d}mm`:i===`80mm`?a?.custom_printable_width_mm?`${a.custom_printable_width_mm}mm`:`72mm`:`48mm`,p=l?`${u}mm auto`:i===`80mm`?`80mm auto`:`58mm auto`,m=i===`80mm`||l&&u>=75?`12px`:`10.5px`,h=a?.font_family||`sans-serif`,g=`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Plus Jakarta Sans', sans-serif`;h===`courier`?g=`'Courier New', Courier, monospace`:h===`consolas`||h===`monospace`?g=`'Consolas', 'Courier New', monospace`:h===`roboto-mono`&&(g=`'Roboto Mono', monospace`);let _=document.createElement(`style`);_.id=r,_.textContent=`
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
            `,document.head.appendChild(_);let v=e.match(/<body[^>]*>([\s\S]*?)<\/body>/i),y=v?v[1]:`<pre>${(t||``).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</pre>`,b=document.createElement(`div`);b.id=n,b.innerHTML=y,document.body.appendChild(b);try{let e=a?.printer_name||a?.usb_printer_name||``;if(typeof o.getPrinters==`function`)try{let t=await o.getPrinters();if(Array.isArray(t)&&t.length>0){if(e){let n=t.find(t=>t.name&&t.name.toLowerCase()===e.toLowerCase()||t.displayName&&t.displayName.toLowerCase()===e.toLowerCase());n&&(e=n.name)}if(!e){let n=t.find(e=>e.isDefault),r=t.find(e=>/pos80|pos58|pos-|thermal|receipt|tm-t|tm-u|xprinter|eppos|vsc|blueprint|panda|iware|codesoft|rpp|mtp/i.test(`${e.name||``} ${e.displayName||``}`)),i=e=>/microsoft print to pdf|xps document writer|onenote|fax/i.test(e||``),a=t.find(e=>!i(e.name));n&&!i(n.name)?e=n.name:r?e=r.name:a?e=a.name:n&&(e=n.name)}}}catch{}await new Promise(e=>requestAnimationFrame(()=>setTimeout(e,30)));let t=l?u*1e3:i===`80mm`?8e4:58e3,n=await o.printReceipt({silent:!0,printerName:e,pageSize:{width:t,height:2e5}});(!n||!n.success)&&(n=await o.printReceipt({silent:!0,printerName:e,pageSize:`A4`})),(!n||!n.success)&&e!==``&&await o.printReceipt({silent:!0,printerName:``,pageSize:`A4`})}finally{b.parentNode&&b.parentNode.removeChild(b),_.parentNode&&_.parentNode.removeChild(_)}})();return}if(k()&&t){let e=j();if(e&&e.address)try{let a=O(u(t,r,i));window.SanubariAndroidBluetooth.printEscPosBase64(a,e.address,Math.max(1,n));return}catch{}}let s=`sanubari-pos-silent-print-frame`,c=document.getElementById(s);c&&c.parentNode&&c.parentNode.removeChild(c);let l=document.createElement(`iframe`);l.id=s,l.setAttribute(`aria-hidden`,`true`),l.style.position=`fixed`,l.style.right=`0`,l.style.bottom=`0`,l.style.width=`0`,l.style.height=`0`,l.style.border=`0`,l.style.opacity=`0`,l.style.pointerEvents=`none`,l.style.zIndex=`-1`,document.body.appendChild(l);let d=l.contentWindow,f=l.contentDocument||d?.document;if(!f||!d)return;let p=!1,m=()=>{if(!p){p=!0;try{d.focus(),d.print()}catch{}window.setTimeout(()=>{l.parentNode&&l.parentNode.removeChild(l)},3e4)}};l.onload=m,f.open(),f.write(e),f.close(),window.setTimeout(m,80)}function f(e,t=`58mm`){let n=typeof t==`string`?{paper_width:t}:t||{},r=n.paper_width||`58mm`,i=r===`custom`,o=Math.max(30,Math.min(120,Number(n.custom_paper_width_mm)||58)),s=Math.max(20,Math.min(o,Number(n.custom_printable_width_mm)||o-4)),c=n.margin_horizontal||`2mm`,u=Math.max(1,Number(n.copies)||1),f=l(e,n),p=i?`${s}mm`:r===`80mm`?n.custom_printable_width_mm?`${n.custom_printable_width_mm}mm`:`72mm`:`48mm`,m=i?`${o}mm auto`:r===`80mm`?`80mm auto`:`58mm auto`,h=n.font_family||`sans-serif`,g=`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Plus Jakarta Sans', Helvetica, Arial, sans-serif`;h===`courier`?g=`'Courier New', Courier, monospace`:h===`consolas`||h===`monospace`?g=`'Consolas', 'Lucida Console', 'Courier New', monospace`:h===`roboto-mono`&&(g=`'Roboto Mono', monospace, 'Courier New'`);let _=n.font_size||`normal`,v=r===`80mm`||i&&o>=75?`12px`:`10.5px`;_===`compact`?v=r===`80mm`||i&&o>=75?`10.5px`:`9.5px`:_===`large`&&(v=r===`80mm`||i&&o>=75?`14px`:`12px`);let y=(n.font_weight||`normal`)===`bold`?`bold`:`normal`,b=n.formatting===`plain`?`<pre>${f.replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</pre>`:a(e,n),x=[`SALINAN PELANGGAN`,`SALINAN KASIR / TOKO`,`SALINAN BAR / DAPUR`],S=``;for(let e=0;e<u;e++){let t=u>1?`<div style="text-align:center;font-weight:bold;font-size:10px;padding:3px 0;margin-bottom:4px;border-bottom:1px dashed #000;">[ ${x[e]||`SALINAN #${e+1}`} ]</div>`:``,n=e<u-1?`<div style="text-align:center;font-size:10px;margin:12px 0;border-top:1px dashed #000;padding-top:4px;color:#000;">- - - - - POTONG DI SINI - - - - -</div>`:``;S+=`<div class="receipt-copy">${t}${b}</div>${n}`}d(`
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
    `,f,u,!!n.open_cash_drawer,r,n)}function p(e,t=`58mm`){let n=typeof t==`string`?{paper_width:t}:t||{},r=l(e,n),i=new TextEncoder().encode(r+`


`),a=new Uint8Array([27,64]),o=n.font_size===`compact`?new Uint8Array([27,77,1]):new Uint8Array([27,77,0]),s=n.font_weight===`bold`?new Uint8Array([27,69,1]):new Uint8Array([27,69,0]),c=n.open_cash_drawer?new Uint8Array([27,112,0,25,250]):new Uint8Array([]),u=(n.paper_width||`58mm`)===`80mm`,d=n.paper_width===`custom`,f=Number(n.custom_paper_width_mm)||58,p=u||d&&f>=75?new Uint8Array([29,86,0]):new Uint8Array([]),m=a.length+o.length+s.length+c.length+i.length+p.length,h=new Uint8Array(m),g=0;return h.set(a,g),g+=a.length,h.set(o,g),g+=o.length,h.set(s,g),g+=s.length,c.length>0&&(h.set(c,g),g+=c.length),h.set(i,g),g+=i.length,p.length>0&&(h.set(p,g),g+=p.length),h}var m=`sanubari_pos_usb_printer_v1`,h=null,g=null;function _(){return typeof window<`u`&&!!window.electronAPI?.isDesktop}async function v(){if(typeof window>`u`)return[];let e=window.electronAPI;if(e&&typeof e.getPrinters==`function`)try{let t=await e.getPrinters();if(Array.isArray(t))return t.map(e=>({name:e.name||``,displayName:e.displayName||e.name||``,isDefault:!!e.isDefault,description:e.description||``,status:e.status}))}catch(e){console.warn(`Failed to get printers from electronAPI:`,e)}return[]}function y(){return typeof navigator<`u`&&`usb`in navigator&&typeof navigator.usb?.requestDevice==`function`}function b(){if(typeof window>`u`)return null;try{let e=localStorage.getItem(m);return e?JSON.parse(e):null}catch{return null}}function x(e){if(!(typeof window>`u`))try{e?localStorage.setItem(m,JSON.stringify(e)):localStorage.removeItem(m)}catch{}}async function S(){if(!y())return!1;try{let e=b();if(!e)return!1;let t=(await navigator.usb.getDevices()).find(t=>t.vendorId===e.vendorId&&t.productId===e.productId);if(!t)return!1;await t.open(),t.configuration===null&&await t.selectConfiguration(1);let n=null,r=null;if(t.configuration&&Array.isArray(t.configuration.interfaces))for(let e of t.configuration.interfaces){for(let t of e.alternates||[]){for(let i of t.endpoints||[])if(i.direction===`out`&&(i.type===`bulk`||i.type===`interrupt`)){n=e.interfaceNumber,r=i.endpointNumber;break}if(r!==null)break}if(r!==null)break}if(n!==null)try{await t.claimInterface(n)}catch{}return h=t,g=r,!0}catch{return!1}}async function C(){if(!y())throw Error(`Browser ini tidak mendukung WebUSB. Silakan gunakan Google Chrome atau Microsoft Edge di Windows.`);let e=await navigator.usb.requestDevice({filters:[]});if(!e)return null;await e.open(),e.configuration===null&&await e.selectConfiguration(1);let t=null,n=null;if(e.configuration&&Array.isArray(e.configuration.interfaces))for(let r of e.configuration.interfaces){for(let e of r.alternates||[]){for(let i of e.endpoints||[])if(i.direction===`out`&&(i.type===`bulk`||i.type===`interrupt`)){t=r.interfaceNumber,n=i.endpointNumber;break}if(n!==null)break}if(n!==null)break}if(t!==null)try{await e.claimInterface(t)}catch{}h=e,g=n;let r=`0x`+e.vendorId.toString(16).padStart(4,`0`).toUpperCase(),i=`0x`+e.productId.toString(16).padStart(4,`0`).toUpperCase(),a={name:e.productName||`Thermal USB Printer (${r}:${i})`,vendorId:e.vendorId,productId:e.productId,productName:e.productName||`Thermal POS Printer`,manufacturerName:e.manufacturerName,serialNumber:e.serialNumber,connected:!0};return x(a),a}async function w(e,t=`58mm`){let n=p(e,typeof t==`string`?{paper_width:t}:t||{});if((!h||!h.opened)&&!await S()&&!await C())return!1;if(!h)throw Error(`Printer USB tidak terhubung.`);let r=g??1;return await h.transferOut(r,n),!0}var T=`sanubari_pos_bt_printer_v1`,E=null,D=null;function O(e){let t=``,n=e.byteLength;for(let r=0;r<n;r++)t+=String.fromCharCode(e[r]);return typeof window<`u`?window.btoa(t):``}function k(){if(typeof window>`u`)return!1;let e=window.SanubariAndroidBluetooth;try{return!!(e&&typeof e.isNativeAvailable==`function`&&e.isNativeAvailable())}catch{return!!e}}function A(){return typeof navigator>`u`?!1:!!navigator.bluetooth}function j(){if(typeof window>`u`)return null;if(k())try{let e=window.SanubariAndroidBluetooth.getStatus(),t=JSON.parse(e);if(t&&t.savedAddress)return{name:t.savedName||`Printer (${t.savedAddress})`,address:t.savedAddress,bonded:!0,isPrinter:!0,connected:!0,source:`android-native`}}catch{}if(E&&D)return{name:E.name||`Printer Bluetooth (Web)`,address:E.id||`WEB-BT`,bonded:!0,isPrinter:!0,connected:!!E.gatt?.connected,source:`web-bluetooth`};try{let e=window.localStorage.getItem(T);if(e)return JSON.parse(e)}catch{}return null}function M(e){if(!(typeof window>`u`))try{e?window.localStorage.setItem(T,JSON.stringify(e)):window.localStorage.removeItem(T)}catch{}}function N(){if(!k())return[];try{let e=window.SanubariAndroidBluetooth.getDevices(),t=JSON.parse(e);return Array.isArray(t)?t.sort((e,t)=>e.connected&&!t.connected?-1:!e.connected&&t.connected?1:e.isPrinter&&!t.isPrinter?-1:!e.isPrinter&&t.isPrinter?1:e.bonded&&!t.bonded?-1:!e.bonded&&t.bonded?1:(e.name||``).localeCompare(t.name||``)):[]}catch{return[]}}function P(){if(!k())return!1;try{return window.SanubariAndroidBluetooth.startScan(),!0}catch{return!1}}function F(){if(k())try{window.SanubariAndroidBluetooth.stopScan()}catch{}}function I(){if(k())try{window.SanubariAndroidBluetooth.openBluetoothSettings();return}catch{}if(typeof window<`u`)try{window.location.href=`intent:#Intent;action=android.settings.BLUETOOTH_SETTINGS;end`}catch{}}function L(e){return new Promise(t=>{if(!k()){t({success:!1,message:`Jembatan Bluetooth Native Android tidak tersedia.`});return}let n=!1,r=window.setTimeout(()=>{n||(n=!0,window.removeEventListener(`sanubari-bt-connect-result`,i),t({success:!1,address:e,message:`Waktu koneksi habis (timeout). Pastikan printer Bluetooth menyala dan berada di dekat perangkat.`}))},16e3),i=a=>{if(n)return;let o=a.detail||{};o.disconnected||(n=!0,window.clearTimeout(r),window.removeEventListener(`sanubari-bt-connect-result`,i),o.success&&M({name:o.name||`Printer (${e})`,address:o.address||e,bonded:!0,isPrinter:!0,connected:!0,source:`android-native`}),t({success:!!o.success,name:o.name,address:o.address||e,message:o.message||(o.success?`Terhubung ke printer!`:`Gagal menghubungkan printer.`)}))};window.addEventListener(`sanubari-bt-connect-result`,i);try{window.SanubariAndroidBluetooth.connectDevice(e)}catch(a){n||(n=!0,window.clearTimeout(r),window.removeEventListener(`sanubari-bt-connect-result`,i),t({success:!1,address:e,message:a?.message||`Gagal memanggil koneksi Bluetooth Android.`}))}})}function R(){if(M(null),k())try{window.SanubariAndroidBluetooth.disconnectDevice()}catch{}if(E){try{E.gatt?.connected&&E.gatt.disconnect()}catch{}E=null,D=null}}async function z(){let e=navigator;if(!e.bluetooth)throw Error(`Web Bluetooth tidak tersedia di browser ini.`);try{let t=await e.bluetooth.requestDevice({acceptAllDevices:!0,optionalServices:[`000018f0-0000-1000-8000-00805f9b34fb`,`49535343-fe7d-4ae5-8fa9-9fafd205e455`,`0000e0ff-0000-1000-8000-00805f9b34fb`,`0000ff00-0000-1000-8000-00805f9b34fb`,`e7810a71-73ae-499d-8c15-faa9aef0c3f1`]});if(!t.gatt)throw Error(`Perangkat printer tidak mendukung koneksi GATT.`);let n=await(await t.gatt.connect()).getPrimaryServices(),r=null;for(let e of n){let t=await e.getCharacteristics();for(let e of t)if(e.properties.write||e.properties.writeWithoutResponse){r=e;break}if(r)break}if(!r)throw Error(`Tidak ditemukan karakteristik cetak pada perangkat Bluetooth ini.`);E=t,D=r;let i={name:t.name||`Printer Bluetooth`,address:t.id||`WEB-BT`,bonded:!0,isPrinter:!0,connected:!0,source:`web-bluetooth`};return M(i),i}catch(e){if(e?.name===`NotFoundError`)return null;throw e}}function B(e,t=`58mm`){return`rawbt:base64,${O(p(e,typeof t==`string`?{paper_width:t}:t||{}))}`}function V(e,t=`58mm`,n){return new Promise(r=>{if(!k()){r({success:!1,message:`Fitur Bluetooth Native Android belum aktif.`});return}let i=typeof t==`string`?{paper_width:t}:t||{},a=Math.max(1,Number(i.copies)||1),o=O(p(e,i)),s=j(),c=n||s?.address||``,l=!1,u=window.setTimeout(()=>{l||(l=!0,window.removeEventListener(`sanubari-bt-print-result`,d),r({success:!1,message:`Waktu cetak habis (timeout). Pastikan printer Bluetooth menyala dan kertas tersedia.`}))},2e4),d=e=>{if(l)return;l=!0,window.clearTimeout(u),window.removeEventListener(`sanubari-bt-print-result`,d);let t=e.detail||{};r({success:!!t.success,needSelectPrinter:!!t.needSelectPrinter,name:t.name,address:t.address,message:t.message||(t.success?`Struk berhasil dicetak!`:`Gagal mencetak struk.`)})};window.addEventListener(`sanubari-bt-print-result`,d);try{window.SanubariAndroidBluetooth.printEscPosBase64(o,c,a)}catch(e){l||(l=!0,window.clearTimeout(u),window.removeEventListener(`sanubari-bt-print-result`,d),r({success:!1,message:e?.message||`Gagal mengirim data cetak ke printer Bluetooth.`}))}})}async function H(e,t=`58mm`,n){if(k()){let r=await V(e,t,n);if(!r.success){let e=Error(r.message);throw e.needSelectPrinter=r.needSelectPrinter,e}return!0}if(!navigator.bluetooth){let e=Error(`Web Bluetooth tidak didukung di WebView ini. Gunakan fitur Pencarian Printer Bluetooth di aplikasi.`);throw e.code=`BT_UNSUPPORTED_WEBVIEW`,e}let r=typeof t==`string`?{paper_width:t}:t||{},i=Math.max(1,Number(r.copies)||1);try{let t=D;if(!t||!E?.gatt?.connected){if(!await z())return!1;t=D}if(!t)throw Error(`Tidak ditemukan karakteristik cetak pada printer Bluetooth ini.`);let n=p(e,r);for(let e=0;e<i;e++){for(let e=0;e<n.length;e+=100){let r=n.slice(e,e+100);t.properties.write?await t.writeValueWithResponse(r):await t.writeValueWithoutResponse(r),await new Promise(e=>setTimeout(e,20))}e<i-1&&await new Promise(e=>setTimeout(e,600))}return!0}catch(e){if(D=null,e.name===`NotFoundError`)return!1;throw e}}function U(e,n){let a=(n||e.customer_phone||``).replace(/[^0-9]/g,``);a.startsWith(`0`)&&(a=`62`+a.substring(1));let s=r(e.items).map((e,n)=>{if(e.type===`bundle`){let r=e.items.map((e,n)=>{let r=t(e.variant_label),i=r&&r!==`Default`&&r!==`Standar`&&r!==`Standard`?` (${r})`:``;return`   ITEM ${n+1}: ${e.product_name}${i} (${e.unit_qty}x = Rp ${o(e.discounted_line_price)})`}).join(`
`);return`${n+1}. *${e.bundleName}* (${e.bundleQty}x)\n${r}\n   Total Paket: Rp ${o(e.totalDiscounted)}`}let r=e.item,i=t(r.variant_label),a=i&&i!==`Default`&&i!==`Standar`?` (${i})`:``;return`${n+1}. *${r.product_name}*${a}\n   ${r.quantity}x @ Rp ${o(r.price)} = Rp ${o(r.subtotal)}${r.custom_notes&&!/^Bundling:/i.test(r.custom_notes)?`\n   _${r.custom_notes}_`:``}`}).join(`

`),c=`*${e.store_name.toUpperCase()}*\n`;c+=`_${e.tagline||`Specialty Coffee Roastery`}_\n`,c+=`========================================
`,c+=`*STRUK PEMBELIAN*
`,c+=`========================================
`,c+=`No. Struk : #${e.order_number}\n`,c+=`Tanggal   : ${e.date}\n`,c+=`Kasir     : ${e.cashier_name}\n`,e.customer_name&&e.customer_name!==`Pelanggan Kasir`&&(c+=`Pelanggan : ${e.customer_name}\n`),e.customer_phone&&e.customer_phone!==`-`&&(c+=`Telepon   : ${e.customer_phone}\n`),e.customer_address&&e.customer_address!==`Toko Fisik / POS Kasir`&&(c+=`Alamat    : ${e.customer_address}\n`),e.shipping_courier&&(e.shipping_cost||0)>0&&(c+=`Ekspedisi : ${e.shipping_courier}\n`),c+=`----------------------------------------
`,c+=`*RINCIAN PESANAN:*

`,c+=`${s}\n`,c+=`----------------------------------------
`,c+=`Subtotal  : Rp ${o(e.subtotal)}\n`,e.discount_amount>0&&(c+=`Diskon    : -Rp ${o(e.discount_amount)}\n`),e.shipping_cost&&e.shipping_cost>0&&(c+=`Ongkir    : Rp ${o(e.shipping_cost)}\n`);let l=i(e.items);l&&(c+=`Total Full: Rp ${o(l.totalFull)}\n`,c+=`DP (${l.dpPercentLabel}) : Rp ${o(l.dpPaid)}\n`,c+=`Sisa Bayar: Rp ${o(l.dpRemaining)}\n`),c+=`*TOTAL    : Rp ${o(e.total_amount)}*\n`,c+=`Metode    : ${e.payment_method_label}\n`,e.cash_tendered&&e.cash_tendered>0&&(c+=`Tunai     : Rp ${o(e.cash_tendered)}\n`,c+=`Kembalian : Rp ${o(e.cash_change||0)}\n`),c+=`----------------------------------------
`,c+=`${e.footer_note||`Terima kasih telah berbelanja di Alat Kopi Malang!`}\n`,e.instagram&&(c+=`\nInstagram: https://instagram.com/${e.instagram.replace(`@`,``)}\n`);let u=encodeURIComponent(c);return a?`https://wa.me/${a}?text=${u}`:`https://wa.me/?text=${u}`}function W(e,t=`58mm`){let n=t===`80mm`?42:32,r=`-`.repeat(n),i=`=`.repeat(n),a=[];a.push(s(e.store_name.toUpperCase(),n)),a.push(s(`RINGKASAN PENJUALAN POS`,n)),a.push(i),a.push(c(`Periode:`,e.period_title,n)),a.push(c(`Dicetak:`,e.printed_at,n)),a.push(c(`Kasir:`,e.cashier_name,n)),a.push(r),a.push(c(`Total Transaksi`,`${e.total_transactions} Trx`,n)),a.push(c(`Total Omset`,`Rp ${o(e.total_revenue)}`,n)),a.push(c(`Rata-rata/Trx`,`Rp ${o(e.average_order_value)}`,n)),a.push(r),a.push(s(`METODE PEMBAYARAN`,n));for(let t of e.payment_breakdown)a.push(c(`${t.label} (${t.count})`,`Rp ${o(t.total)}`,n));if(a.push(r),e.cash_drawer&&(a.push(s(`ARUS KAS TUNAI LACI`,n)),a.push(c(`Penjualan Tunai`,`+Rp ${o(e.cash_drawer.cash_sales)}`,n)),a.push(c(`Kas Masuk Lain`,`+Rp ${o(e.cash_drawer.cash_in)}`,n)),a.push(c(`Kas Keluar Toko`,`-Rp ${o(e.cash_drawer.cash_out)}`,n)),a.push(c(`TOTAL KAS DI LACI`,`Rp ${o(e.cash_drawer.net_cash)}`,n)),a.push(r)),e.top_products&&e.top_products.length>0){a.push(s(`PRODUK TERLARIS`,n));for(let t of e.top_products.slice(0,5))a.push(t.name.length>n?t.name.substring(0,n):t.name),a.push(c(`  ${t.quantity}x (${t.variant})`,`Rp ${o(t.total)}`,n));a.push(r)}return a.push(i),a.push(s(`LAPORAN RESMI POS SANUBARI`,n)),a.join(`
`)}function G(e,t=`58mm`){let n=W(e,t),r=t===`80mm`?`76mm`:`48mm`,i=t===`80mm`?`80mm auto`:`58mm auto`;d(`
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
    `,n,1,!1,t)}function K(e,t=`58mm`,n){let r=n?.receipt_columns||(t===`80mm`?42:32),i=`-`.repeat(r),a=`=`.repeat(r),l=[];if(l.push(s(e.store_name.toUpperCase(),r)),l.push(s(`LAPORAN LABA RUGI (P&L)`,r)),l.push(a),l.push(c(`Periode:`,e.period_title,r)),l.push(c(`Dicetak:`,e.printed_at,r)),l.push(c(`Kasir:`,e.cashier_name,r)),l.push(i),l.push(s(`1. PENDAPATAN PENJUALAN`,r)),l.push(c(`Total Transaksi`,`${e.total_transactions} Trx`,r)),l.push(c(`Barang Terjual`,`${e.items_sold} Item`,r)),l.push(c(`Penjualan Kotor`,`Rp ${o(e.gross_sales)}`,r)),e.total_discounts>0&&l.push(c(`Diskon Penjualan`,`-Rp ${o(e.total_discounts)}`,r)),l.push(c(`PENJUALAN BERSIH`,`Rp ${o(e.net_sales)}`,r)),l.push(i),l.push(s(`2. HARGA POKOK PENJUALAN`,r)),l.push(c(`Total HPP (COGS)`,`-Rp ${o(e.total_cogs)}`,r)),l.push(i),l.push(s(`3. LABA KOTOR (GROSS)`,r)),l.push(c(`Laba Kotor`,`Rp ${o(e.gross_profit)}`,r)),l.push(c(`Gross Margin`,`${e.gross_margin_pct}%`,r)),l.push(i),e.total_expenses>0||e.expense_breakdown&&e.expense_breakdown.length>0){if(l.push(s(`4. BEBAN KAS OPERASIONAL`,r)),e.expense_breakdown)for(let t of e.expense_breakdown)l.push(c(`- ${t.label}`,`-Rp ${o(t.total)}`,r));l.push(c(`TOTAL BEBAN KAS`,`-Rp ${o(e.total_expenses)}`,r)),l.push(i)}e.other_income>0&&(l.push(c(`Pendapatan Lain`,`+Rp ${o(e.other_income)}`,r)),l.push(i)),l.push(a),l.push(c(`LABA BERSIH (NET)`,`Rp ${o(e.net_profit)}`,r)),l.push(c(`Net Profit Margin`,`${e.net_margin_pct}%`,r)),l.push(a),l.push(s(`ALAT KOPI MALANG POS`,r));let u=n?.margin_feed_lines||2;for(let e=0;e<u;e++)l.push(``);return l.join(`
`)}function q(e,t=`58mm`,n){let r=K(e,t,n),i=t===`80mm`?`76mm`:`48mm`,a=t===`80mm`?`80mm auto`:`58mm auto`,o=n?.margin_horizontal||`1mm`;d(`
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
    `,r,1,!1,t)}function J(e){let n=e.items.map((e,n)=>{let r=t(e.variant_label),i=r&&r!==`Default`&&r!==`Standar`?` (${r})`:``;return`${n+1}. *${e.product_name}*${i}\n   ${e.quantity}x @ Rp ${o(e.price)} = Rp ${o(e.subtotal)}${e.custom_notes&&!/^Bundling:/i.test(e.custom_notes)?`\n   _${e.custom_notes}_`:``}`}).join(`

`),r=`*${e.store_name.toUpperCase()}*\n`;return e.tagline&&(r+=`_${e.tagline}_\n`),r+=`========================================
`,r+=`*ESTIMASI PESANAN (PRE-BILL)*
`,r+=`========================================
`,r+=`Status    : Menunggu Pembayaran
`,r+=`Waktu     : ${e.date}\n`,r+=`Kasir     : ${e.cashier_name}\n`,e.customer_name&&e.customer_name.trim()&&(r+=`Pelanggan : ${e.customer_name.trim()}\n`),e.customer_phone&&e.customer_phone.trim()&&(r+=`Telepon   : ${e.customer_phone.trim()}\n`),e.customer_address&&e.customer_address.trim()&&(r+=`Alamat    : ${e.customer_address.trim()}\n`),e.shipping_courier&&(e.shipping_cost||0)>0&&(r+=`Ekspedisi : ${e.shipping_courier.trim()}\n`),e.notes&&e.notes.trim()&&(r+=`Catatan   : ${e.notes.trim()}\n`),r+=`----------------------------------------
`,r+=`*RINCIAN PESANAN:*

`,r+=`${n}\n`,r+=`----------------------------------------
`,r+=`Subtotal  : Rp ${o(e.subtotal)}\n`,e.discount_amount>0&&(r+=`Diskon    : -Rp ${o(e.discount_amount)}\n`),e.shipping_cost&&e.shipping_cost>0&&(r+=`Ongkir    : Rp ${o(e.shipping_cost)}\n`),r+=`*TOTAL TAGIHAN : Rp ${o(e.total_amount)}*\n`,r+=`----------------------------------------
`,(e.bank_info||e.qris_instructions)&&(r+=`*Informasi Pembayaran:*
`,e.bank_info&&(r+=`- Rekening: ${e.bank_info}\n`),e.qris_instructions&&(r+=`- QRIS: ${e.qris_instructions}\n`),r+=`----------------------------------------
`),r+=`Silakan konfirmasi pesanan ini atau lakukan pembayaran di kasir / transfer bank.
Terima kasih!
`,e.instagram&&(r+=`\nInstagram: https://instagram.com/${e.instagram.replace(`@`,``)}\n`),r}function Y(e,t){let n=(t||e.customer_phone||``).replace(/[^0-9]/g,``);n.startsWith(`0`)&&(n=`62`+n.substring(1));let r=J(e),i=encodeURIComponent(r);return n?`https://wa.me/${n}?text=${i}`:`https://wa.me/?text=${i}`}function X(e,n=`58mm`){let r=n===`80mm`?42:32,i=`-`.repeat(r),a=`=`.repeat(r),l=[];l.push(s(e.store_name.toUpperCase(),r)),e.tagline&&l.push(s(e.tagline,r)),e.address&&l.push(s(e.address,r)),e.phone&&l.push(s(`Telp/WA: ${e.phone}`,r)),l.push(a),l.push(s(`ESTIMASI PESANAN (PRE-BILL)`,r)),l.push(s(`** BELUM DIBAYAR **`,r)),l.push(i),l.push(c(`Waktu:`,e.date,r)),l.push(c(`Kasir:`,e.cashier_name,r)),e.customer_name&&l.push(c(`Pelanggan:`,e.customer_name,r)),e.customer_phone&&l.push(c(`Telp/WA:`,e.customer_phone,r)),e.customer_address&&l.push(`Alamat: ${e.customer_address}`),l.push(i);for(let n of e.items){let e=n.product_name.length>r?n.product_name.substring(0,r):n.product_name;l.push(e);let i=`  ${n.quantity}x @${o(n.price)} (${t(n.variant_label)})`,a=`Rp ${o(n.subtotal)}`;l.push(c(i,a,r))}if(l.push(i),l.push(c(`Subtotal`,`Rp ${o(e.subtotal)}`,r)),e.discount_amount>0&&l.push(c(`Diskon`,`-Rp ${o(e.discount_amount)}`,r)),e.shipping_cost&&e.shipping_cost>0){let t=e.shipping_courier?` (${e.shipping_courier})`:``;l.push(c(`Ongkir${t}`,`Rp ${o(e.shipping_cost)}`,r))}return l.push(a),l.push(c(`TOTAL TAGIHAN`,`Rp ${o(e.total_amount)}`,r)),l.push(i),e.bank_info&&(l.push(s(`PEMBAYARAN TRANSFER:`,r)),l.push(s(e.bank_info,r)),l.push(i)),l.push(s(`Silakan lakukan pembayaran di kasir`,r)),l.push(s(`Terima kasih!`,r)),l.join(`
`)}function Z(e,t=`58mm`){let n=X(e,t);d(`
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
    `,n,1,!1,t)}function Q(e){let n=595.28,a=841.89,s=553.28,c=e=>(e||``).replace(/[•★]/g,`*`).replace(/[—–]/g,`-`).replace(/[“”]/g,`"`).replace(/[‘’]/g,`'`).replace(/[^\x20-\x7E]/g,``).replace(/\\/g,`\\\\`).replace(/\(/g,`\\(`).replace(/\)/g,`\\)`),l=(e,t)=>{let n=(e||``).trim();return n.length<=t?n:n.slice(0,t-3)+`...`},u=(e,t)=>{let n=(e||``).replace(/\s+/g,` `).trim();if(!n)return[];let r=n.split(` `),i=[],a=``;for(let e of r)a?(a+` `+e).length<=t?a+=` `+e:(i.push(a),a=e):a=e;return a&&i.push(a),i},d=(e,t,n)=>{let r=(e||``).replace(/[^\x20-\x7E]/g,``);if(t===`F4`)return r.length*n*.6;let i=t===`F2`?.55:.51,a=0;for(let e=0;e<r.length;e++){let t=r[e];`ilI1.,:;!| '()`.includes(t)?a+=n*.28:`MW@%mw`.includes(t)?a+=n*.78:a+=t>=`A`&&t<=`Z`?n*(i+.09):n*i}return a},f=(e,t,n,r,i,o)=>{let s=a-t;return`BT /${r} ${i.toFixed(2)} Tf ${o[0].toFixed(3)} ${o[1].toFixed(3)} ${o[2].toFixed(3)} rg ${e.toFixed(2)} ${s.toFixed(2)} Td (${c(n)}) Tj ET`},p=(e,t,n,r,i,a)=>{let o=d(n,r,i);return f(Math.max(12,e-o),t,n,r,i,a)},m=(e,t,n,r,i,a,o)=>{let s=d(r,i,a);return f(e+Math.max(0,(t-s)/2),n,r,i,a,o)},h=(e,t,n,r,i,o,s=1)=>{let c=a-(t+r),l=[`q`];i&&l.push(`${i[0].toFixed(3)} ${i[1].toFixed(3)} ${i[2].toFixed(3)} rg`),o&&l.push(`${o[0].toFixed(3)} ${o[1].toFixed(3)} ${o[2].toFixed(3)} RG ${s.toFixed(2)} w`);let u=i&&o?`B`:i?`f`:`S`;return l.push(`${e.toFixed(2)} ${c.toFixed(2)} ${n.toFixed(2)} ${r.toFixed(2)} re ${u} Q`),l.join(` `)},g=(e,t,n,r,i,o=1)=>{let s=a-t,c=a-r;return`q ${i[0].toFixed(3)} ${i[1].toFixed(3)} ${i[2].toFixed(3)} RG ${o.toFixed(2)} w ${e.toFixed(2)} ${s.toFixed(2)} m ${n.toFixed(2)} ${c.toFixed(2)} l S Q`},_=(e.store_name||`ALAT KOPI MALANG`).toUpperCase(),v=e.tagline||`Close to Your Every Brew`,y=e.address||`Ruko Tlogomas Square Kav. 34, Jl. Raya Tlogomas, Lowokwaru, Kota Malang`,b=e.phone||`+6282132095241`,x=e.date||``,S=e.cashier_name||`Kasir Sanubari`,C=(e.customer_name||``).trim()||`Pelanggan Sanubari`,w=!!(e.notes&&e.notes.toLowerCase().includes(`no. struk:`)),T=[];T.push(h(0,0,n,a,[1,1,1],null)),T.push(f(42,58,_,`F2`,17,[.067,.094,.153])),T.push(f(42,73,v,`F3`,9.5,[.294,.333,.388]));let E=88;for(let e of u(y,58))T.push(f(42,E,e,`F1`,8.5,[.42,.447,.502])),E+=12;T.push(f(42,E,`Telp/WA: ${b}`,`F1`,8.5,[.42,.447,.502]));let D=387.28;T.push(h(D,44,166,18,[.925,.992,.961],[.655,.953,.816],.8)),T.push(m(D,166,56,`FAKTUR PENJUALAN DIGITAL (A4)`,`F2`,8,[.024,.373,.275])),T.push(p(s,76,`Waktu: ${x} WIB`,`F2`,9.5,[.067,.094,.153])),T.push(p(s,90,`Kasir: ${S}`,`F1`,9,[.294,.333,.388]));let O=w?`LUNAS (PAID)`:`ESTIMASI (PRE-BILL)`,k=w?86:112,A=s-k;w?(T.push(h(A,97,k,16,[.82,.98,.898],[.431,.906,.718],.8)),T.push(m(A,k,108,O,`F2`,8,[.024,.373,.275]))):(T.push(h(A,97,k,16,[.996,.953,.78],[.992,.902,.541],.8)),T.push(m(A,k,108,O,`F2`,8,[.471,.208,.059])));let j=Math.max(E+14,124);T.push(g(42,j,s,j,[.067,.094,.153],1.8));let M=j+18;T.push(f(42,M,`DITUJUKAN KEPADA:`,`F2`,8,[.612,.639,.686])),T.push(f(42,M+15,C,`F2`,12.5,[.067,.094,.153]));let N=M+29;if(e.customer_phone&&e.customer_phone!==`-`&&(T.push(f(42,N,`No. WhatsApp: ${e.customer_phone}`,`F1`,9,[.294,.333,.388])),N+=13),e.customer_address&&e.customer_address!==`Toko Fisik / POS Kasir`)for(let t of u(`Alamat Kirim: ${e.customer_address}`,56))T.push(f(42,N,t,`F1`,8.5,[.216,.255,.318])),N+=12;if(e.shipping_courier&&(e.shipping_cost||0)>0&&(T.push(f(42,N,`Ekspedisi: ${e.shipping_courier}`,`F1`,8.5,[.294,.333,.388])),N+=12),e.notes)for(let t of u(`Catatan: ${e.notes}`,60))T.push(f(42,N,t,`F3`,8.5,[.42,.447,.502])),N+=12;T.push(p(s,M,`STATUS DOKUMEN:`,`F2`,8,[.612,.639,.686])),T.push(p(s,M+14,w?`PEMBAYARAN LUNAS`:`MENUNGGU PEMBAYARAN`,`F2`,9.5,w?[.024,.373,.275]:[.573,.251,.055])),T.push(p(s,M+27,`POS Cashier Digital Invoice`,`F1`,8.5,[.42,.447,.502]));let P=Math.max(N+12,M+46),F=398.28,I=549.28;T.push(m(42,28,P,`NO`,`F2`,8,[.294,.333,.388])),T.push(f(76,P,`DESKRIPSI PRODUK & VARIAN`,`F2`,8,[.294,.333,.388])),T.push(p(F,P,`HARGA`,`F2`,8,[.294,.333,.388])),T.push(m(423.28,40,P,`QTY`,`F2`,8,[.294,.333,.388])),T.push(p(I,P,`JUMLAH (IDR)`,`F2`,8,[.294,.333,.388]));let L=P+8;T.push(g(42,L,s,L,[.82,.835,.859],1.3));let R=r(e.items);for(let e=0;e<R.length&&!(L>651.89);e++){let n=R[e];if(n.type===`bundle`){T.push(m(42,28,L+16,String(e+1),`F4`,9,[.42,.447,.502])),T.push(f(76,L+14,l(n.bundleName,44),`F2`,10,[.067,.094,.153]));let r=L+27;n.items.forEach((e,n)=>{let i=t(e.variant_label),a=i&&i!==`Standard`&&i!==`Standar`,s=`ITEM ${n+1}: ${e.product_name}${a?` (${i})`:``} (${e.unit_qty}x @ Rp ${o(e.discounted_line_price)})`;T.push(f(76,r,l(s,58),`F1`,8,[.35,.38,.44])),r+=11}),T.push(p(F,L+18,`Rp ${o(Math.round(n.totalDiscounted/n.bundleQty))}`,`F1`,9.5,[.216,.255,.318])),T.push(m(423.28,40,L+18,`${n.bundleQty}x`,`F2`,9.5,[.067,.094,.153])),T.push(p(I,L+18,`Rp ${o(n.totalDiscounted)}`,`F2`,9.5,[.067,.094,.153])),L=Math.max(L+34,r+6),T.push(g(42,L,s,L,[.898,.906,.922],.7));continue}let r=n.item;T.push(m(42,28,L+16,String(e+1),`F4`,9,[.42,.447,.502])),T.push(f(76,L+14,l(r.product_name,44),`F2`,10,[.067,.094,.153])),T.push(f(76,L+26,`Varian: ${l(t(r.variant_label)||`Standar`,48)}`,`F1`,8.5,[.42,.447,.502]));let i=L+37;if(r.custom_notes&&!/^Bundling:/i.test(r.custom_notes)){let e=u(r.custom_notes,54);for(let t of e)T.push(f(76,i,t,`F1`,7.8,[.012,.412,.631])),i+=10}T.push(p(F,L+19,`Rp ${o(r.price)}`,`F1`,9.5,[.216,.255,.318])),T.push(m(423.28,40,L+19,String(r.quantity),`F2`,9.5,[.067,.094,.153])),T.push(p(I,L+19,`Rp ${o(r.subtotal)}`,`F2`,9.5,[.067,.094,.153])),L=Math.max(L+34,i+4),T.push(g(42,L,s,L,[.898,.906,.922],.7))}let z=L+18,B=z;if(e.bank_info||e.qris_instructions){let t=[];e.bank_info&&t.push(...u(`Rekening Bank: ${e.bank_info}`,44)),e.qris_instructions&&t.push(...u(`QRIS: ${e.qris_instructions}`,44));let n=26+t.length*13;T.push(h(42,B,281.204,n,[.976,.98,.984],[.898,.906,.922],.8)),T.push(f(52,B+15,`PETUNJUK PEMBAYARAN TRANSFER / QRIS:`,`F2`,8.5,[.024,.373,.275]));let r=B+29;for(let e of t)T.push(f(52,r,e,`F1`,8.5,[.067,.094,.153])),r+=13;B+=n+14}T.push(h(42,B,148,44,[1,1,1],[.122,.161,.216],1.4)),T.push(m(42,148,B+12,`ALAT KOPI MALANG`,`F2`,7,[.42,.447,.502])),T.push(m(42,148,B+26,w?`* RESMI (LUNAS) *`:`* RESMI (PRE-BILL) *`,`F2`,9.5,[.024,.373,.275])),T.push(m(42,148,B+38,`MALANG - ${x}`,`F4`,6.8,[.612,.639,.686]));let V=i(e.items),H=1;V&&(H+=3),e.discount_amount>0&&H++,(e.shipping_cost||0)>0&&H++;let U=46+H*16;T.push(h(348.768,z,204.512,U,[.976,.98,.984],[.898,.906,.922],.8));let W=z+18;if(V&&(T.push(f(360.768,W,`Total Pesanan (Full):`,`F1`,9,[.294,.333,.388])),T.push(p(541.28,W,`Rp ${o(V.totalFull)}`,`F2`,9,[.067,.094,.153])),W+=16,T.push(f(360.768,W,`DP Dibayar (${V.dpPercentLabel}):`,`F2`,9,[.012,.412,.631])),T.push(p(541.28,W,`Rp ${o(V.dpPaid)}`,`F2`,9,[.012,.412,.631])),W+=16,T.push(f(360.768,W,`Sisa Pelunasan:`,`F2`,9,[.706,.325,.035])),T.push(p(541.28,W,`Rp ${o(V.dpRemaining)}`,`F2`,9,[.706,.325,.035])),W+=16),T.push(f(360.768,W,`Subtotal:`,`F1`,9.5,[.294,.333,.388])),T.push(p(541.28,W,`Rp ${o(e.subtotal)}`,`F2`,9.5,[.067,.094,.153])),W+=16,e.discount_amount>0&&(T.push(f(360.768,W,`Potongan Diskon:`,`F1`,9.5,[.016,.471,.341])),T.push(p(541.28,W,`-Rp ${o(e.discount_amount)}`,`F2`,9.5,[.016,.471,.341])),W+=16),(e.shipping_cost||0)>0){let t=`Ongkos Kirim${e.shipping_courier?` (${e.shipping_courier})`:``}:`;T.push(f(360.768,W,l(t,24),`F1`,9.5,[.118,.251,.686])),T.push(p(541.28,W,`Rp ${o(e.shipping_cost||0)}`,`F2`,9.5,[.118,.251,.686])),W+=16}T.push(g(360.768,W-4,541.28,W-4,[.82,.835,.859],1.2)),T.push(f(360.768,W+14,`TOTAL:`,`F2`,10.5,[.067,.094,.153])),T.push(p(541.28,W+15,`Rp ${o(e.total_amount)}`,`F2`,14.5,[.067,.094,.153]));let G=Math.max(B+44+34,z+U+34);T.push(g(42,G,s,G,[.898,.906,.922],.8)),T.push(m(42,511.28,G+16,`Terima kasih telah memesan di Alat Kopi Malang! Dokumen ini adalah faktur digital resmi format A4 yang diterbitkan oleh sistem POS Sanubari.`,`F1`,8,[.612,.639,.686]));let K=T.join(`
`),q=[`<< /Type /Catalog /Pages 2 0 R >>`,`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${n.toFixed(2)} ${a.toFixed(2)}] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R /F4 7 0 R >> >> /Contents 8 0 R >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>`,`<< /Length ${K.length} >>\nstream\n${K}\nendstream`],J=`%PDF-1.4
`,Y=[];for(let e=0;e<q.length;e++)Y.push(J.length),J+=`${e+1} 0 obj\n${q[e]}\nendobj\n`;let X=J.length,Z=q.length+1;J+=`xref\n0 ${Z}\n0000000000 65535 f \n`;for(let e of Y)J+=`${String(e).padStart(10,`0`)} 00000 n \n`;J+=`trailer\n<< /Size ${Z} /Root 1 0 R >>\nstartxref\n${X}\n%%EOF`;let Q=new Uint8Array(J.length);for(let e=0;e<J.length;e++)Q[e]=J.charCodeAt(e)&255;return Q}function $(e){if(typeof window>`u`)return;let t=`Invoice-Sanubari-Roastery-${(e.customer_name||`Pelanggan`).replace(/[^a-zA-Z0-9_-]/g,`-`).replace(/-+/g,`-`).replace(/^-|-$/g,``)||`Pelanggan`}.pdf`;if((k()||/SanubariPOS-Android|wv|Android/i.test(navigator.userAgent||``))&&navigator.onLine)try{let n=JSON.stringify(e),r=O(new TextEncoder().encode(n)).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``),i=`/pos/download-apk?invoice_pdf=1&payload=${encodeURIComponent(r)}`;if(/SanubariPOS-Android/i.test(navigator.userAgent||``)||k()){window.location.href=i;return}let a=document.createElement(`a`);a.href=i,a.download=t,document.body.appendChild(a),a.click(),document.body.removeChild(a);return}catch{}let n=Q(e),r=new Blob([n],{type:`application/pdf`}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=t,a.style.display=`none`,document.body.appendChild(a),a.click(),document.body.removeChild(a),window.setTimeout(()=>{URL.revokeObjectURL(i)},1e4)}export{F as A,G as C,S as D,f as E,z as O,q as S,w as T,_,o as a,$ as b,Y as c,N as d,v as f,k as g,r as h,i,P as k,B as l,b as m,L as n,l as o,j as p,R as r,J as s,t,U as u,A as v,H as w,Z as x,I as y};