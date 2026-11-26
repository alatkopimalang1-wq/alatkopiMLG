function e(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}function t(e){return e?e.replace(/\s*\(1\s*kg\s*custom[^)]*\)/gi,``).trim():``}function n(e){if(e.bundle_name&&e.bundle_name.trim())return e.bundle_name.trim();if(e.custom_notes){let t=e.custom_notes.match(/^Bundling:\s*(.+?)(?:\s*\(Diskon:.*\))?$/i);if(t&&t[1])return t[1].trim()}return null}function r(e){let t=[],r=new Map;for(let i of e){let e=n(i);if(!e){t.push({type:`single`,item:i});continue}let a=i.bundle_id?`id:${i.bundle_id}`:`name:${e}`,o=i.bundle_unit_qty&&i.bundle_unit_qty>0?i.bundle_unit_qty:1,s=Math.max(1,Math.round(i.quantity/o)),c=i.price*i.quantity,l=i.subtotal??Math.max(0,c-(i.discount_amount||0)),u=i.price*o,d=Math.round(l/s),f=r.get(a);if(f!==void 0){let e=t[f];e.type===`bundle`&&(e.totalNormal+=c,e.totalDiscounted+=l,e.items.push({product_name:i.product_name,variant_label:i.variant_label,unit_qty:o,normal_line_price:u,discounted_line_price:d}))}else r.set(a,t.length),t.push({type:`bundle`,bundleName:e,bundleQty:s,totalNormal:c,totalDiscounted:l,items:[{product_name:i.product_name,variant_label:i.variant_label,unit_qty:o,normal_line_price:u,discounted_line_price:d}]})}return t}function i(n,i={}){let o=(i.paper_width||`80mm`)===`80mm`||i.custom_paper_width_mm&&i.custom_paper_width_mm>=75,s=o?`11px`:`9.5px`,c=o?`14px`:`12px`,l=o?`14px`:`12px`,u=i.font_family||`sans-serif`,d=`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Plus Jakarta Sans', Helvetica, Arial, sans-serif`;u===`consolas`||u===`monospace`?d=`'Consolas', 'Courier New', monospace`:u===`courier`?d=`'Courier New', Courier, monospace`:u===`roboto-mono`&&(d=`'Roboto Mono', monospace`);let f=r(n.items).map(n=>{if(n.type===`bundle`){let r=n.items.map((n,r)=>{let i=t(n.variant_label),o=i&&i!==`Standard`&&i!==`Standar`;return`
                            <tr>
                                <td colspan="2" style="padding-left: 6px; padding-top: 2px; font-size: 9.5px; color: #555; font-weight: 700;">
                                    ITEM ${r+1}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-left: 6px; font-size: ${s}; color: #111;">
                                    ${e(n.product_name)}${o?` (${e(i)})`:``}
                                </td>
                                <td style="text-align: right; white-space: nowrap; font-weight: 700; font-size: ${s}; color: #000;">
                                    ${n.unit_qty}x Rp ${a(n.discounted_line_price)}
                                </td>
                            </tr>
                        `}).join(``);return`
                    <tr>
                        <td colspan="2" style="font-weight: 800; padding-top: 5px; font-size: ${s}; color: #000;">
                            ${e(n.bundleName)}
                        </td>
                    </tr>
                    ${r}
                    <tr>
                        <td style="font-weight: 700; padding-top: 3px; padding-bottom: 5px; font-size: ${s}; color: #000; border-bottom: 1px dashed #ccc;">
                            Total Harga Paket (${n.bundleQty}x)
                        </td>
                        <td style="text-align: right; font-weight: 800; padding-top: 3px; padding-bottom: 5px; white-space: nowrap; font-size: ${s}; color: #000; border-bottom: 1px dashed #ccc;">
                            Rp ${a(n.totalDiscounted)}
                        </td>
                    </tr>
                `}let r=n.item,i=r.variant_label?` (${e(t(r.variant_label))})`:``;return`
            <tr>
                <td colspan="2" style="font-weight: 700; padding-top: 4px; font-size: ${s}; color: #000; line-height: 1.3;">
                    ${e(r.product_name)}${i}
                </td>
            </tr>
            <tr>
                <td style="text-align: left; padding-left: 4px; padding-bottom: 4px; font-size: ${s}; color: #222;">
                    ${r.quantity} x Rp ${a(r.price)}
                </td>
                <td style="text-align: right; font-weight: 700; padding-bottom: 4px; white-space: nowrap; font-size: ${s}; color: #000; font-variant-numeric: tabular-nums;">
                    Rp ${a(r.subtotal)}
                </td>
            </tr>
        `}).join(``);return`
    <div class="sanubari-receipt-body" style="width: 100%; box-sizing: border-box; color: #000000; font-family: ${d}; font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 8px;">
            ${i.show_logo===!1?``:`<div style="font-weight: 900; font-size: ${c}; letter-spacing: 1px; text-transform: uppercase;">ALAT KOPI MALANG</div>`}
            <div style="font-size: ${c}; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">
                ${e(n.store_name||`Alat Kopi Malang`)}
            </div>
            ${n.tagline?`<div style="font-size: 10px; font-style: italic; color: #333; margin-top: 1px;">${e(n.tagline)}</div>`:``}
            ${n.address?`<div style="font-size: 9.5px; line-height: 1.3; color: #333; margin-top: 2px;">${e(n.address)}</div>`:``}
            ${n.phone?`<div style="font-size: 9.5px; color: #333;">WA: ${e(n.phone)}</div>`:``}
        </div>

        <div style="border-bottom: 1.5px dashed #000000; margin: 6px 0;"></div>

        <!-- Refund Notice -->
        ${n.is_refund?`
            <div style="text-align: center; font-weight: 900; font-size: ${s}; margin: 4px 0;">
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
            ${f}
        </table>

        <div style="border-bottom: 1px dashed #000000; margin: 6px 0;"></div>

        <!-- Totals -->
        <table style="width: 100%; font-size: ${s}; border-collapse: collapse; color: #000; font-variant-numeric: tabular-nums;">
            <tr>
                <td style="text-align: left; padding: 2px 0;">Subtotal</td>
                <td style="text-align: right; white-space: nowrap; font-weight: 700;">Rp ${a(n.subtotal)}</td>
            </tr>
            ${n.discount_amount>0?`
            <tr>
                <td style="text-align: left; padding: 2px 0; font-weight: 700;">Diskon</td>
                <td style="text-align: right; font-weight: 700; white-space: nowrap;">-Rp ${a(n.discount_amount)}</td>
            </tr>
            `:``}
            ${n.shipping_cost&&n.shipping_cost>0?`
            <tr>
                <td style="text-align: left; padding: 2px 0;">Ongkir (${e(n.shipping_courier||`Kurir`)})</td>
                <td style="text-align: right; white-space: nowrap;">Rp ${a(n.shipping_cost)}</td>
            </tr>
            `:``}
            <tr style="border-top: 1.5px dashed #000000;">
                <td style="text-align: left; font-weight: 900; font-size: ${l}; padding: 5px 0;">TOTAL</td>
                <td style="text-align: right; font-weight: 900; font-size: ${l}; padding: 5px 0; white-space: nowrap;">
                    Rp ${a(n.total_amount)}
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
                <td style="text-align: right; white-space: nowrap;">Rp ${a(n.cash_tendered)}</td>
            </tr>
            <tr>
                <td style="text-align: left; padding: 2px 0; font-weight: 700;">Kembalian</td>
                <td style="text-align: right; font-weight: 700; white-space: nowrap;">Rp ${a(n.cash_change||0)}</td>
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
    `}function a(e){let t=typeof e==`number`&&!isNaN(e)?e:0;return new Intl.NumberFormat(`id-ID`).format(t)}function o(e,t){if(e.length>=t)return e.substring(0,t);let n=Math.floor((t-e.length)/2),r=t-e.length-n;return` `.repeat(n)+e+` `.repeat(r)}function s(e,t,n){let r=Math.max(1,n-e.length-t.length);return e+` `.repeat(r)+t}function c(e,n=`58mm`){let i=typeof n==`string`?{paper_width:n}:n||{},c=i.paper_width||`58mm`,l=c===`custom`,u=Number(i.receipt_columns)||(l?Number(i.custom_receipt_columns)||40:c===`80mm`?Number(i.receipt_columns_80mm)||44:Number(i.receipt_columns_58mm)||32),d=Number(i.max_item_name_length)||(u>=44?Math.min(u-12,34):u>=38?26:Math.min(u-10,22)),f=i.show_logo??!0,p=Number(i.margin_feed_lines)??2,m=`-`.repeat(u),h=`=`.repeat(u),g=[];f&&g.push(o(`*** ALAT KOPI MALANG ***`,u)),g.push(o(e.store_name.toUpperCase(),u)),e.tagline&&g.push(o(e.tagline,u)),e.address&&g.push(o(e.address,u)),e.phone&&g.push(o(`WA: ${e.phone}`,u)),g.push(h),e.is_refund&&(g.push(o(`*** BUKTI REFUND / RETUR ***`,u)),g.push(o(`DANA TELAH DIKEMBALIKAN`,u)),e.refund_reason&&g.push(s(`Alasan: ${e.refund_reason}`,``,u)),g.push(h)),g.push(s(`No: #${e.order_number}`,``,u)),g.push(s(`Tgl: ${e.date}`,`Kasir: ${e.cashier_name}`,u)),e.customer_name&&e.customer_name!==`Pelanggan Kasir`&&g.push(s(`Pelanggan: ${e.customer_name}`,``,u)),e.customer_phone&&e.customer_phone!==`-`&&g.push(s(`Telp/WA: ${e.customer_phone}`,``,u)),e.customer_address&&e.customer_address!==`Toko Fisik / POS Kasir`&&g.push(`Alamat: ${e.customer_address}`),g.push(m);for(let n of r(e.items)){if(n.type===`bundle`){g.push(n.bundleName.substring(0,u)),n.items.forEach((e,n)=>{let r=t(e.variant_label),i=r&&r!==`Standard`&&r!==`Standar`;g.push(`  ITEM ${n+1}: ${e.product_name}${i?` (${r})`:``}`.substring(0,u)),g.push(s(`    ${e.unit_qty}x`,a(e.discounted_line_price),u))}),g.push(s(`Total Paket (${n.bundleQty}x)`,a(n.totalDiscounted),u));continue}let e=n.item,r=`${e.product_name} (${t(e.variant_label)})`,i=Math.min(d,u);if(r.length<=i)g.push(r);else{let e=r;for(;e.length>0;){if(e.length<=i){g.push(e);break}let t=e.lastIndexOf(` `,i);t<=0&&(t=i),g.push(e.substring(0,t)),e=e.substring(t).trim()}}let o=`  ${e.quantity}x ${a(e.price)}`,c=a(e.subtotal);g.push(s(o,c,u))}if(g.push(m),g.push(s(`Subtotal`,`Rp ${a(e.subtotal)}`,u)),e.discount_amount>0&&g.push(s(`Diskon`,`-Rp ${a(e.discount_amount)}`,u)),e.shipping_cost&&e.shipping_cost>0){let t=e.shipping_courier?` (${e.shipping_courier})`:``;g.push(s(`Ongkir${t}`,`Rp ${a(e.shipping_cost)}`,u))}g.push(s(`TOTAL`,`Rp ${a(e.total_amount)}`,u)),g.push(m),e.is_refund&&(g.push(s(`TOTAL REFUND`,`Rp ${a(e.refund_amount||e.total_amount)}`,u)),g.push(s(`Status Kasir`,`SUDAH DI-REFUND`,u)),g.push(m)),g.push(s(`Metode Bayar`,e.payment_method_label,u)),e.cash_tendered&&e.cash_tendered>0&&(g.push(s(`Bayar Tunai`,`Rp ${a(e.cash_tendered)}`,u)),g.push(s(`Kembalian`,`Rp ${a(e.cash_change||0)}`,u))),g.push(h),e.footer_note&&e.footer_note.split(`
`).forEach(e=>g.push(o(e,u))),e.instagram&&g.push(o(`IG: ${e.instagram}`,u));for(let e=0;e<p;e++)g.push(``);return g.join(`
`)}function l(e,t=!1,n=`58mm`){let r=new TextEncoder().encode(e+`


`),i=new Uint8Array([27,64]),a=t?new Uint8Array([27,112,0,25,250]):new Uint8Array([]),o=n===`80mm`?new Uint8Array([29,86,0]):new Uint8Array([]),s=new Uint8Array(i.length+a.length+r.length+o.length),c=0;return s.set(i,c),c+=i.length,a.length>0&&(s.set(a,c),c+=a.length),s.set(r,c),c+=r.length,o.length>0&&(s.set(o,c),c+=o.length),s}function u(e,t,n=1,r=!1,i=`58mm`,a){if(typeof window>`u`||typeof document>`u`)return;let o=window.electronAPI;if(o&&typeof o.printReceipt==`function`){(async()=>{let n=`sanubari-pos-direct-print-root`,r=`sanubari-pos-direct-print-style`,s=document.getElementById(n);s&&s.parentNode&&s.parentNode.removeChild(s);let c=document.getElementById(r);c&&c.parentNode&&c.parentNode.removeChild(c);let l=i===`custom`||a?.paper_width===`custom`,u=Math.max(30,Math.min(120,Number(a?.custom_paper_width_mm)||58)),d=Math.max(20,Math.min(u,Number(a?.custom_printable_width_mm)||u-4)),f=l?`${d}mm`:i===`80mm`?a?.custom_printable_width_mm?`${a.custom_printable_width_mm}mm`:`72mm`:`48mm`,p=l?`${u}mm auto`:i===`80mm`?`80mm auto`:`58mm auto`,m=i===`80mm`||l&&u>=75?`12px`:`10.5px`,h=a?.font_family||`sans-serif`,g=`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Plus Jakarta Sans', sans-serif`;h===`courier`?g=`'Courier New', Courier, monospace`:h===`consolas`||h===`monospace`?g=`'Consolas', 'Courier New', monospace`:h===`roboto-mono`&&(g=`'Roboto Mono', monospace`);let _=document.createElement(`style`);_.id=r,_.textContent=`
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
            `,document.head.appendChild(_);let v=e.match(/<body[^>]*>([\s\S]*?)<\/body>/i),y=v?v[1]:`<pre>${(t||``).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</pre>`,b=document.createElement(`div`);b.id=n,b.innerHTML=y,document.body.appendChild(b);try{let e=a?.printer_name||a?.usb_printer_name||``;if(typeof o.getPrinters==`function`)try{let t=await o.getPrinters();if(Array.isArray(t)&&t.length>0){if(e){let n=t.find(t=>t.name&&t.name.toLowerCase()===e.toLowerCase()||t.displayName&&t.displayName.toLowerCase()===e.toLowerCase());n&&(e=n.name)}if(!e){let n=t.find(e=>e.isDefault),r=t.find(e=>/pos80|pos58|pos-|thermal|receipt|tm-t|tm-u|xprinter|eppos|vsc|blueprint|panda|iware|codesoft|rpp|mtp/i.test(`${e.name||``} ${e.displayName||``}`)),i=e=>/microsoft print to pdf|xps document writer|onenote|fax/i.test(e||``),a=t.find(e=>!i(e.name));n&&!i(n.name)?e=n.name:r?e=r.name:a?e=a.name:n&&(e=n.name)}}}catch{}await new Promise(e=>requestAnimationFrame(()=>setTimeout(e,30)));let t=l?u*1e3:i===`80mm`?8e4:58e3,n=await o.printReceipt({silent:!0,printerName:e,pageSize:{width:t,height:2e5}});(!n||!n.success)&&(n=await o.printReceipt({silent:!0,printerName:e,pageSize:`A4`})),(!n||!n.success)&&e!==``&&await o.printReceipt({silent:!0,printerName:``,pageSize:`A4`})}finally{b.parentNode&&b.parentNode.removeChild(b),_.parentNode&&_.parentNode.removeChild(_)}})();return}if(O()&&t){let e=A();if(e&&e.address)try{let a=D(l(t,r,i));window.SanubariAndroidBluetooth.printEscPosBase64(a,e.address,Math.max(1,n));return}catch{}}let s=`sanubari-pos-silent-print-frame`,c=document.getElementById(s);c&&c.parentNode&&c.parentNode.removeChild(c);let u=document.createElement(`iframe`);u.id=s,u.setAttribute(`aria-hidden`,`true`),u.style.position=`fixed`,u.style.right=`0`,u.style.bottom=`0`,u.style.width=`0`,u.style.height=`0`,u.style.border=`0`,u.style.opacity=`0`,u.style.pointerEvents=`none`,u.style.zIndex=`-1`,document.body.appendChild(u);let d=u.contentWindow,f=u.contentDocument||d?.document;if(!f||!d)return;let p=!1,m=()=>{if(!p){p=!0;try{d.focus(),d.print()}catch{}window.setTimeout(()=>{u.parentNode&&u.parentNode.removeChild(u)},3e4)}};u.onload=m,f.open(),f.write(e),f.close(),window.setTimeout(m,80)}function d(e,t=`58mm`){let n=typeof t==`string`?{paper_width:t}:t||{},r=n.paper_width||`58mm`,a=r===`custom`,o=Math.max(30,Math.min(120,Number(n.custom_paper_width_mm)||58)),s=Math.max(20,Math.min(o,Number(n.custom_printable_width_mm)||o-4)),l=n.margin_horizontal||`2mm`,d=Math.max(1,Number(n.copies)||1),f=c(e,n),p=a?`${s}mm`:r===`80mm`?n.custom_printable_width_mm?`${n.custom_printable_width_mm}mm`:`72mm`:`48mm`,m=a?`${o}mm auto`:r===`80mm`?`80mm auto`:`58mm auto`,h=n.font_family||`sans-serif`,g=`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Plus Jakarta Sans', Helvetica, Arial, sans-serif`;h===`courier`?g=`'Courier New', Courier, monospace`:h===`consolas`||h===`monospace`?g=`'Consolas', 'Lucida Console', 'Courier New', monospace`:h===`roboto-mono`&&(g=`'Roboto Mono', monospace, 'Courier New'`);let _=n.font_size||`normal`,v=r===`80mm`||a&&o>=75?`12px`:`10.5px`;_===`compact`?v=r===`80mm`||a&&o>=75?`10.5px`:`9.5px`:_===`large`&&(v=r===`80mm`||a&&o>=75?`14px`:`12px`);let y=(n.font_weight||`normal`)===`bold`?`bold`:`normal`,b=n.formatting===`plain`?`<pre>${f.replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</pre>`:i(e,n),x=[`SALINAN PELANGGAN`,`SALINAN KASIR / TOKO`,`SALINAN BAR / DAPUR`],S=``;for(let e=0;e<d;e++){let t=d>1?`<div style="text-align:center;font-weight:bold;font-size:10px;padding:3px 0;margin-bottom:4px;border-bottom:1px dashed #000;">[ ${x[e]||`SALINAN #${e+1}`} ]</div>`:``,n=e<d-1?`<div style="text-align:center;font-size:10px;margin:12px 0;border-top:1px dashed #000;padding-top:4px;color:#000;">- - - - - POTONG DI SINI - - - - -</div>`:``;S+=`<div class="receipt-copy">${t}${b}</div>${n}`}u(`
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
            padding: 2mm ${l};
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
                padding: 0 ${l};
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
    `,f,d,!!n.open_cash_drawer,r,n)}function f(e,t=`58mm`){let n=typeof t==`string`?{paper_width:t}:t||{},r=c(e,n),i=new TextEncoder().encode(r+`


`),a=new Uint8Array([27,64]),o=n.font_size===`compact`?new Uint8Array([27,77,1]):new Uint8Array([27,77,0]),s=n.font_weight===`bold`?new Uint8Array([27,69,1]):new Uint8Array([27,69,0]),l=n.open_cash_drawer?new Uint8Array([27,112,0,25,250]):new Uint8Array([]),u=(n.paper_width||`58mm`)===`80mm`,d=n.paper_width===`custom`,f=Number(n.custom_paper_width_mm)||58,p=u||d&&f>=75?new Uint8Array([29,86,0]):new Uint8Array([]),m=a.length+o.length+s.length+l.length+i.length+p.length,h=new Uint8Array(m),g=0;return h.set(a,g),g+=a.length,h.set(o,g),g+=o.length,h.set(s,g),g+=s.length,l.length>0&&(h.set(l,g),g+=l.length),h.set(i,g),g+=i.length,p.length>0&&(h.set(p,g),g+=p.length),h}var p=`sanubari_pos_usb_printer_v1`,m=null,h=null;function g(){return typeof window<`u`&&!!window.electronAPI?.isDesktop}async function _(){if(typeof window>`u`)return[];let e=window.electronAPI;if(e&&typeof e.getPrinters==`function`)try{let t=await e.getPrinters();if(Array.isArray(t))return t.map(e=>({name:e.name||``,displayName:e.displayName||e.name||``,isDefault:!!e.isDefault,description:e.description||``,status:e.status}))}catch(e){console.warn(`Failed to get printers from electronAPI:`,e)}return[]}function v(){return typeof navigator<`u`&&`usb`in navigator&&typeof navigator.usb?.requestDevice==`function`}function y(){if(typeof window>`u`)return null;try{let e=localStorage.getItem(p);return e?JSON.parse(e):null}catch{return null}}function b(e){if(!(typeof window>`u`))try{e?localStorage.setItem(p,JSON.stringify(e)):localStorage.removeItem(p)}catch{}}async function x(){if(!v())return!1;try{let e=y();if(!e)return!1;let t=(await navigator.usb.getDevices()).find(t=>t.vendorId===e.vendorId&&t.productId===e.productId);if(!t)return!1;await t.open(),t.configuration===null&&await t.selectConfiguration(1);let n=null,r=null;if(t.configuration&&Array.isArray(t.configuration.interfaces))for(let e of t.configuration.interfaces){for(let t of e.alternates||[]){for(let i of t.endpoints||[])if(i.direction===`out`&&(i.type===`bulk`||i.type===`interrupt`)){n=e.interfaceNumber,r=i.endpointNumber;break}if(r!==null)break}if(r!==null)break}if(n!==null)try{await t.claimInterface(n)}catch{}return m=t,h=r,!0}catch{return!1}}async function S(){if(!v())throw Error(`Browser ini tidak mendukung WebUSB. Silakan gunakan Google Chrome atau Microsoft Edge di Windows.`);let e=await navigator.usb.requestDevice({filters:[]});if(!e)return null;await e.open(),e.configuration===null&&await e.selectConfiguration(1);let t=null,n=null;if(e.configuration&&Array.isArray(e.configuration.interfaces))for(let r of e.configuration.interfaces){for(let e of r.alternates||[]){for(let i of e.endpoints||[])if(i.direction===`out`&&(i.type===`bulk`||i.type===`interrupt`)){t=r.interfaceNumber,n=i.endpointNumber;break}if(n!==null)break}if(n!==null)break}if(t!==null)try{await e.claimInterface(t)}catch{}m=e,h=n;let r=`0x`+e.vendorId.toString(16).padStart(4,`0`).toUpperCase(),i=`0x`+e.productId.toString(16).padStart(4,`0`).toUpperCase(),a={name:e.productName||`Thermal USB Printer (${r}:${i})`,vendorId:e.vendorId,productId:e.productId,productName:e.productName||`Thermal POS Printer`,manufacturerName:e.manufacturerName,serialNumber:e.serialNumber,connected:!0};return b(a),a}async function C(e,t=`58mm`){let n=f(e,typeof t==`string`?{paper_width:t}:t||{});if((!m||!m.opened)&&!await x()&&!await S())return!1;if(!m)throw Error(`Printer USB tidak terhubung.`);let r=h??1;return await m.transferOut(r,n),!0}var w=`sanubari_pos_bt_printer_v1`,T=null,E=null;function D(e){let t=``,n=e.byteLength;for(let r=0;r<n;r++)t+=String.fromCharCode(e[r]);return typeof window<`u`?window.btoa(t):``}function O(){if(typeof window>`u`)return!1;let e=window.SanubariAndroidBluetooth;try{return!!(e&&typeof e.isNativeAvailable==`function`&&e.isNativeAvailable())}catch{return!!e}}function k(){return typeof navigator>`u`?!1:!!navigator.bluetooth}function A(){if(typeof window>`u`)return null;if(O())try{let e=window.SanubariAndroidBluetooth.getStatus(),t=JSON.parse(e);if(t&&t.savedAddress)return{name:t.savedName||`Printer (${t.savedAddress})`,address:t.savedAddress,bonded:!0,isPrinter:!0,connected:!0,source:`android-native`}}catch{}if(T&&E)return{name:T.name||`Printer Bluetooth (Web)`,address:T.id||`WEB-BT`,bonded:!0,isPrinter:!0,connected:!!T.gatt?.connected,source:`web-bluetooth`};try{let e=window.localStorage.getItem(w);if(e)return JSON.parse(e)}catch{}return null}function j(e){if(!(typeof window>`u`))try{e?window.localStorage.setItem(w,JSON.stringify(e)):window.localStorage.removeItem(w)}catch{}}function M(){if(!O())return[];try{let e=window.SanubariAndroidBluetooth.getDevices(),t=JSON.parse(e);return Array.isArray(t)?t.sort((e,t)=>e.connected&&!t.connected?-1:!e.connected&&t.connected?1:e.isPrinter&&!t.isPrinter?-1:!e.isPrinter&&t.isPrinter?1:e.bonded&&!t.bonded?-1:!e.bonded&&t.bonded?1:(e.name||``).localeCompare(t.name||``)):[]}catch{return[]}}function N(){if(!O())return!1;try{return window.SanubariAndroidBluetooth.startScan(),!0}catch{return!1}}function P(){if(O())try{window.SanubariAndroidBluetooth.stopScan()}catch{}}function F(){if(O())try{window.SanubariAndroidBluetooth.openBluetoothSettings();return}catch{}if(typeof window<`u`)try{window.location.href=`intent:#Intent;action=android.settings.BLUETOOTH_SETTINGS;end`}catch{}}function I(e){return new Promise(t=>{if(!O()){t({success:!1,message:`Jembatan Bluetooth Native Android tidak tersedia.`});return}let n=!1,r=window.setTimeout(()=>{n||(n=!0,window.removeEventListener(`sanubari-bt-connect-result`,i),t({success:!1,address:e,message:`Waktu koneksi habis (timeout). Pastikan printer Bluetooth menyala dan berada di dekat perangkat.`}))},16e3),i=a=>{if(n)return;let o=a.detail||{};o.disconnected||(n=!0,window.clearTimeout(r),window.removeEventListener(`sanubari-bt-connect-result`,i),o.success&&j({name:o.name||`Printer (${e})`,address:o.address||e,bonded:!0,isPrinter:!0,connected:!0,source:`android-native`}),t({success:!!o.success,name:o.name,address:o.address||e,message:o.message||(o.success?`Terhubung ke printer!`:`Gagal menghubungkan printer.`)}))};window.addEventListener(`sanubari-bt-connect-result`,i);try{window.SanubariAndroidBluetooth.connectDevice(e)}catch(a){n||(n=!0,window.clearTimeout(r),window.removeEventListener(`sanubari-bt-connect-result`,i),t({success:!1,address:e,message:a?.message||`Gagal memanggil koneksi Bluetooth Android.`}))}})}function L(){if(j(null),O())try{window.SanubariAndroidBluetooth.disconnectDevice()}catch{}if(T){try{T.gatt?.connected&&T.gatt.disconnect()}catch{}T=null,E=null}}async function R(){let e=navigator;if(!e.bluetooth)throw Error(`Web Bluetooth tidak tersedia di browser ini.`);try{let t=await e.bluetooth.requestDevice({acceptAllDevices:!0,optionalServices:[`000018f0-0000-1000-8000-00805f9b34fb`,`49535343-fe7d-4ae5-8fa9-9fafd205e455`,`0000e0ff-0000-1000-8000-00805f9b34fb`,`0000ff00-0000-1000-8000-00805f9b34fb`,`e7810a71-73ae-499d-8c15-faa9aef0c3f1`]});if(!t.gatt)throw Error(`Perangkat printer tidak mendukung koneksi GATT.`);let n=await(await t.gatt.connect()).getPrimaryServices(),r=null;for(let e of n){let t=await e.getCharacteristics();for(let e of t)if(e.properties.write||e.properties.writeWithoutResponse){r=e;break}if(r)break}if(!r)throw Error(`Tidak ditemukan karakteristik cetak pada perangkat Bluetooth ini.`);T=t,E=r;let i={name:t.name||`Printer Bluetooth`,address:t.id||`WEB-BT`,bonded:!0,isPrinter:!0,connected:!0,source:`web-bluetooth`};return j(i),i}catch(e){if(e?.name===`NotFoundError`)return null;throw e}}function z(e,t=`58mm`){return`rawbt:base64,${D(f(e,typeof t==`string`?{paper_width:t}:t||{}))}`}function B(e,t=`58mm`,n){return new Promise(r=>{if(!O()){r({success:!1,message:`Fitur Bluetooth Native Android belum aktif.`});return}let i=typeof t==`string`?{paper_width:t}:t||{},a=Math.max(1,Number(i.copies)||1),o=D(f(e,i)),s=A(),c=n||s?.address||``,l=!1,u=window.setTimeout(()=>{l||(l=!0,window.removeEventListener(`sanubari-bt-print-result`,d),r({success:!1,message:`Waktu cetak habis (timeout). Pastikan printer Bluetooth menyala dan kertas tersedia.`}))},2e4),d=e=>{if(l)return;l=!0,window.clearTimeout(u),window.removeEventListener(`sanubari-bt-print-result`,d);let t=e.detail||{};r({success:!!t.success,needSelectPrinter:!!t.needSelectPrinter,name:t.name,address:t.address,message:t.message||(t.success?`Struk berhasil dicetak!`:`Gagal mencetak struk.`)})};window.addEventListener(`sanubari-bt-print-result`,d);try{window.SanubariAndroidBluetooth.printEscPosBase64(o,c,a)}catch(e){l||(l=!0,window.clearTimeout(u),window.removeEventListener(`sanubari-bt-print-result`,d),r({success:!1,message:e?.message||`Gagal mengirim data cetak ke printer Bluetooth.`}))}})}async function V(e,t=`58mm`,n){if(O()){let r=await B(e,t,n);if(!r.success){let e=Error(r.message);throw e.needSelectPrinter=r.needSelectPrinter,e}return!0}if(!navigator.bluetooth){let e=Error(`Web Bluetooth tidak didukung di WebView ini. Gunakan fitur Pencarian Printer Bluetooth di aplikasi.`);throw e.code=`BT_UNSUPPORTED_WEBVIEW`,e}let r=typeof t==`string`?{paper_width:t}:t||{},i=Math.max(1,Number(r.copies)||1);try{let t=E;if(!t||!T?.gatt?.connected){if(!await R())return!1;t=E}if(!t)throw Error(`Tidak ditemukan karakteristik cetak pada printer Bluetooth ini.`);let n=f(e,r);for(let e=0;e<i;e++){for(let e=0;e<n.length;e+=100){let r=n.slice(e,e+100);t.properties.write?await t.writeValueWithResponse(r):await t.writeValueWithoutResponse(r),await new Promise(e=>setTimeout(e,20))}e<i-1&&await new Promise(e=>setTimeout(e,600))}return!0}catch(e){if(E=null,e.name===`NotFoundError`)return!1;throw e}}function H(e,n){let i=(n||e.customer_phone||``).replace(/[^0-9]/g,``);i.startsWith(`0`)&&(i=`62`+i.substring(1));let o=r(e.items).map((e,n)=>{if(e.type===`bundle`){let r=e.items.map((e,n)=>{let r=t(e.variant_label),i=r&&r!==`Default`&&r!==`Standar`&&r!==`Standard`?` (${r})`:``;return`   ITEM ${n+1}: ${e.product_name}${i} (${e.unit_qty}x = Rp ${a(e.discounted_line_price)})`}).join(`
`);return`${n+1}. *${e.bundleName}* (${e.bundleQty}x)\n${r}\n   Total Paket: Rp ${a(e.totalDiscounted)}`}let r=e.item,i=t(r.variant_label),o=i&&i!==`Default`&&i!==`Standar`?` (${i})`:``;return`${n+1}. *${r.product_name}*${o}\n   ${r.quantity}x @ Rp ${a(r.price)} = Rp ${a(r.subtotal)}`}).join(`

`),s=`*${e.store_name.toUpperCase()}*\n`;s+=`_${e.tagline||`Specialty Coffee Roastery`}_\n`,s+=`========================================
`,s+=`*STRUK PEMBELIAN*
`,s+=`========================================
`,s+=`No. Struk : #${e.order_number}\n`,s+=`Tanggal   : ${e.date}\n`,s+=`Kasir     : ${e.cashier_name}\n`,e.customer_name&&e.customer_name!==`Pelanggan Kasir`&&(s+=`Pelanggan : ${e.customer_name}\n`),e.customer_phone&&e.customer_phone!==`-`&&(s+=`Telepon   : ${e.customer_phone}\n`),e.customer_address&&e.customer_address!==`Toko Fisik / POS Kasir`&&(s+=`Alamat    : ${e.customer_address}\n`),e.shipping_courier&&(e.shipping_cost||0)>0&&(s+=`Ekspedisi : ${e.shipping_courier}\n`),s+=`----------------------------------------
`,s+=`*RINCIAN PESANAN:*

`,s+=`${o}\n`,s+=`----------------------------------------
`,s+=`Subtotal  : Rp ${a(e.subtotal)}\n`,e.discount_amount>0&&(s+=`Diskon    : -Rp ${a(e.discount_amount)}\n`),e.shipping_cost&&e.shipping_cost>0&&(s+=`Ongkir    : Rp ${a(e.shipping_cost)}\n`),s+=`*TOTAL    : Rp ${a(e.total_amount)}*\n`,s+=`Metode    : ${e.payment_method_label}\n`,e.cash_tendered&&e.cash_tendered>0&&(s+=`Tunai     : Rp ${a(e.cash_tendered)}\n`,s+=`Kembalian : Rp ${a(e.cash_change||0)}\n`),s+=`----------------------------------------
`,s+=`${e.footer_note||`Terima kasih telah berbelanja di Alat Kopi Malang!`}\n`,e.instagram&&(s+=`\nInstagram: https://instagram.com/${e.instagram.replace(`@`,``)}\n`);let c=encodeURIComponent(s);return i?`https://wa.me/${i}?text=${c}`:`https://wa.me/?text=${c}`}function U(e,t=`58mm`){let n=t===`80mm`?42:32,r=`-`.repeat(n),i=`=`.repeat(n),c=[];c.push(o(e.store_name.toUpperCase(),n)),c.push(o(`RINGKASAN PENJUALAN POS`,n)),c.push(i),c.push(s(`Periode:`,e.period_title,n)),c.push(s(`Dicetak:`,e.printed_at,n)),c.push(s(`Kasir:`,e.cashier_name,n)),c.push(r),c.push(s(`Total Transaksi`,`${e.total_transactions} Trx`,n)),c.push(s(`Total Omset`,`Rp ${a(e.total_revenue)}`,n)),c.push(s(`Rata-rata/Trx`,`Rp ${a(e.average_order_value)}`,n)),c.push(r),c.push(o(`METODE PEMBAYARAN`,n));for(let t of e.payment_breakdown)c.push(s(`${t.label} (${t.count})`,`Rp ${a(t.total)}`,n));if(c.push(r),e.cash_drawer&&(c.push(o(`ARUS KAS TUNAI LACI`,n)),c.push(s(`Penjualan Tunai`,`+Rp ${a(e.cash_drawer.cash_sales)}`,n)),c.push(s(`Kas Masuk Lain`,`+Rp ${a(e.cash_drawer.cash_in)}`,n)),c.push(s(`Kas Keluar Toko`,`-Rp ${a(e.cash_drawer.cash_out)}`,n)),c.push(s(`TOTAL KAS DI LACI`,`Rp ${a(e.cash_drawer.net_cash)}`,n)),c.push(r)),e.top_products&&e.top_products.length>0){c.push(o(`PRODUK TERLARIS`,n));for(let t of e.top_products.slice(0,5))c.push(t.name.length>n?t.name.substring(0,n):t.name),c.push(s(`  ${t.quantity}x (${t.variant})`,`Rp ${a(t.total)}`,n));c.push(r)}return c.push(i),c.push(o(`LAPORAN RESMI POS SANUBARI`,n)),c.join(`
`)}function W(e,t=`58mm`){let n=U(e,t),r=t===`80mm`?`76mm`:`48mm`,i=t===`80mm`?`80mm auto`:`58mm auto`;u(`
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
    `,n,1,!1,t)}function G(e,t=`58mm`,n){let r=n?.receipt_columns||(t===`80mm`?42:32),i=`-`.repeat(r),c=`=`.repeat(r),l=[];if(l.push(o(e.store_name.toUpperCase(),r)),l.push(o(`LAPORAN LABA RUGI (P&L)`,r)),l.push(c),l.push(s(`Periode:`,e.period_title,r)),l.push(s(`Dicetak:`,e.printed_at,r)),l.push(s(`Kasir:`,e.cashier_name,r)),l.push(i),l.push(o(`1. PENDAPATAN PENJUALAN`,r)),l.push(s(`Total Transaksi`,`${e.total_transactions} Trx`,r)),l.push(s(`Barang Terjual`,`${e.items_sold} Item`,r)),l.push(s(`Penjualan Kotor`,`Rp ${a(e.gross_sales)}`,r)),e.total_discounts>0&&l.push(s(`Diskon Penjualan`,`-Rp ${a(e.total_discounts)}`,r)),l.push(s(`PENJUALAN BERSIH`,`Rp ${a(e.net_sales)}`,r)),l.push(i),l.push(o(`2. HARGA POKOK PENJUALAN`,r)),l.push(s(`Total HPP (COGS)`,`-Rp ${a(e.total_cogs)}`,r)),l.push(i),l.push(o(`3. LABA KOTOR (GROSS)`,r)),l.push(s(`Laba Kotor`,`Rp ${a(e.gross_profit)}`,r)),l.push(s(`Gross Margin`,`${e.gross_margin_pct}%`,r)),l.push(i),e.total_expenses>0||e.expense_breakdown&&e.expense_breakdown.length>0){if(l.push(o(`4. BEBAN KAS OPERASIONAL`,r)),e.expense_breakdown)for(let t of e.expense_breakdown)l.push(s(`- ${t.label}`,`-Rp ${a(t.total)}`,r));l.push(s(`TOTAL BEBAN KAS`,`-Rp ${a(e.total_expenses)}`,r)),l.push(i)}e.other_income>0&&(l.push(s(`Pendapatan Lain`,`+Rp ${a(e.other_income)}`,r)),l.push(i)),l.push(c),l.push(s(`LABA BERSIH (NET)`,`Rp ${a(e.net_profit)}`,r)),l.push(s(`Net Profit Margin`,`${e.net_margin_pct}%`,r)),l.push(c),l.push(o(`ALAT KOPI MALANG POS`,r));let u=n?.margin_feed_lines||2;for(let e=0;e<u;e++)l.push(``);return l.join(`
`)}function K(e,t=`58mm`,n){let r=G(e,t,n),i=t===`80mm`?`76mm`:`48mm`,a=t===`80mm`?`80mm auto`:`58mm auto`,o=n?.margin_horizontal||`1mm`;u(`
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
    `,r,1,!1,t)}function q(e){let n=e.items.map((e,n)=>{let r=t(e.variant_label),i=r&&r!==`Default`&&r!==`Standar`?` (${r})`:``;return`${n+1}. *${e.product_name}*${i}\n   ${e.quantity}x @ Rp ${a(e.price)} = Rp ${a(e.subtotal)}`}).join(`

`),r=`*${e.store_name.toUpperCase()}*\n`;return e.tagline&&(r+=`_${e.tagline}_\n`),r+=`========================================
`,r+=`*ESTIMASI PESANAN (PRE-BILL)*
`,r+=`========================================
`,r+=`Status    : Menunggu Pembayaran
`,r+=`Waktu     : ${e.date}\n`,r+=`Kasir     : ${e.cashier_name}\n`,e.customer_name&&e.customer_name.trim()&&(r+=`Pelanggan : ${e.customer_name.trim()}\n`),e.customer_phone&&e.customer_phone.trim()&&(r+=`Telepon   : ${e.customer_phone.trim()}\n`),e.customer_address&&e.customer_address.trim()&&(r+=`Alamat    : ${e.customer_address.trim()}\n`),e.shipping_courier&&(e.shipping_cost||0)>0&&(r+=`Ekspedisi : ${e.shipping_courier.trim()}\n`),e.notes&&e.notes.trim()&&(r+=`Catatan   : ${e.notes.trim()}\n`),r+=`----------------------------------------
`,r+=`*RINCIAN PESANAN:*

`,r+=`${n}\n`,r+=`----------------------------------------
`,r+=`Subtotal  : Rp ${a(e.subtotal)}\n`,e.discount_amount>0&&(r+=`Diskon    : -Rp ${a(e.discount_amount)}\n`),e.shipping_cost&&e.shipping_cost>0&&(r+=`Ongkir    : Rp ${a(e.shipping_cost)}\n`),r+=`*TOTAL TAGIHAN : Rp ${a(e.total_amount)}*\n`,r+=`----------------------------------------
`,(e.bank_info||e.qris_instructions)&&(r+=`*Informasi Pembayaran:*
`,e.bank_info&&(r+=`- Rekening: ${e.bank_info}\n`),e.qris_instructions&&(r+=`- QRIS: ${e.qris_instructions}\n`),r+=`----------------------------------------
`),r+=`Silakan konfirmasi pesanan ini atau lakukan pembayaran di kasir / transfer bank.
Terima kasih!
`,e.instagram&&(r+=`\nInstagram: https://instagram.com/${e.instagram.replace(`@`,``)}\n`),r}function J(e,t){let n=(t||e.customer_phone||``).replace(/[^0-9]/g,``);n.startsWith(`0`)&&(n=`62`+n.substring(1));let r=q(e),i=encodeURIComponent(r);return n?`https://wa.me/${n}?text=${i}`:`https://wa.me/?text=${i}`}function Y(e,n=`58mm`){let r=n===`80mm`?42:32,i=`-`.repeat(r),c=`=`.repeat(r),l=[];l.push(o(e.store_name.toUpperCase(),r)),e.tagline&&l.push(o(e.tagline,r)),e.address&&l.push(o(e.address,r)),e.phone&&l.push(o(`Telp/WA: ${e.phone}`,r)),l.push(c),l.push(o(`ESTIMASI PESANAN (PRE-BILL)`,r)),l.push(o(`** BELUM DIBAYAR **`,r)),l.push(i),l.push(s(`Waktu:`,e.date,r)),l.push(s(`Kasir:`,e.cashier_name,r)),e.customer_name&&l.push(s(`Pelanggan:`,e.customer_name,r)),e.customer_phone&&l.push(s(`Telp/WA:`,e.customer_phone,r)),e.customer_address&&l.push(`Alamat: ${e.customer_address}`),l.push(i);for(let n of e.items){let e=n.product_name.length>r?n.product_name.substring(0,r):n.product_name;l.push(e);let i=`  ${n.quantity}x @${a(n.price)} (${t(n.variant_label)})`,o=`Rp ${a(n.subtotal)}`;l.push(s(i,o,r))}if(l.push(i),l.push(s(`Subtotal`,`Rp ${a(e.subtotal)}`,r)),e.discount_amount>0&&l.push(s(`Diskon`,`-Rp ${a(e.discount_amount)}`,r)),e.shipping_cost&&e.shipping_cost>0){let t=e.shipping_courier?` (${e.shipping_courier})`:``;l.push(s(`Ongkir${t}`,`Rp ${a(e.shipping_cost)}`,r))}return l.push(c),l.push(s(`TOTAL TAGIHAN`,`Rp ${a(e.total_amount)}`,r)),l.push(i),e.bank_info&&(l.push(o(`PEMBAYARAN TRANSFER:`,r)),l.push(o(e.bank_info,r)),l.push(i)),l.push(o(`Silakan lakukan pembayaran di kasir`,r)),l.push(o(`Terima kasih!`,r)),l.join(`
`)}function X(e,t=`58mm`){let n=Y(e,t);u(`
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
    `,n,1,!1,t)}function Z(e){let n=595.28,i=841.89,o=553.28,s=e=>(e||``).replace(/[•★]/g,`*`).replace(/[—–]/g,`-`).replace(/[“”]/g,`"`).replace(/[‘’]/g,`'`).replace(/[^\x20-\x7E]/g,``).replace(/\\/g,`\\\\`).replace(/\(/g,`\\(`).replace(/\)/g,`\\)`),c=(e,t)=>{let n=(e||``).trim();return n.length<=t?n:n.slice(0,t-3)+`...`},l=(e,t)=>{let n=(e||``).replace(/\s+/g,` `).trim();if(!n)return[];let r=n.split(` `),i=[],a=``;for(let e of r)a?(a+` `+e).length<=t?a+=` `+e:(i.push(a),a=e):a=e;return a&&i.push(a),i},u=(e,t,n)=>{let r=(e||``).replace(/[^\x20-\x7E]/g,``);if(t===`F4`)return r.length*n*.6;let i=t===`F2`?.55:.51,a=0;for(let e=0;e<r.length;e++){let t=r[e];`ilI1.,:;!| '()`.includes(t)?a+=n*.28:`MW@%mw`.includes(t)?a+=n*.78:a+=t>=`A`&&t<=`Z`?n*(i+.09):n*i}return a},d=(e,t,n,r,a,o)=>{let c=i-t;return`BT /${r} ${a.toFixed(2)} Tf ${o[0].toFixed(3)} ${o[1].toFixed(3)} ${o[2].toFixed(3)} rg ${e.toFixed(2)} ${c.toFixed(2)} Td (${s(n)}) Tj ET`},f=(e,t,n,r,i,a)=>{let o=u(n,r,i);return d(Math.max(12,e-o),t,n,r,i,a)},p=(e,t,n,r,i,a,o)=>{let s=u(r,i,a);return d(e+Math.max(0,(t-s)/2),n,r,i,a,o)},m=(e,t,n,r,a,o,s=1)=>{let c=i-(t+r),l=[`q`];a&&l.push(`${a[0].toFixed(3)} ${a[1].toFixed(3)} ${a[2].toFixed(3)} rg`),o&&l.push(`${o[0].toFixed(3)} ${o[1].toFixed(3)} ${o[2].toFixed(3)} RG ${s.toFixed(2)} w`);let u=a&&o?`B`:a?`f`:`S`;return l.push(`${e.toFixed(2)} ${c.toFixed(2)} ${n.toFixed(2)} ${r.toFixed(2)} re ${u} Q`),l.join(` `)},h=(e,t,n,r,a,o=1)=>{let s=i-t,c=i-r;return`q ${a[0].toFixed(3)} ${a[1].toFixed(3)} ${a[2].toFixed(3)} RG ${o.toFixed(2)} w ${e.toFixed(2)} ${s.toFixed(2)} m ${n.toFixed(2)} ${c.toFixed(2)} l S Q`},g=(e.store_name||`ALAT KOPI MALANG`).toUpperCase(),_=e.tagline||`Close to Your Every Brew`,v=e.address||`Ruko Tlogomas Square Kav. 34, Jl. Raya Tlogomas, Lowokwaru, Kota Malang`,y=e.phone||`+6282132095241`,b=e.date||``,x=e.cashier_name||`Kasir Sanubari`,S=(e.customer_name||``).trim()||`Pelanggan Sanubari`,C=!!(e.notes&&e.notes.toLowerCase().includes(`no. struk:`)),w=[];w.push(m(0,0,n,i,[1,1,1],null)),w.push(d(42,58,g,`F2`,17,[.067,.094,.153])),w.push(d(42,73,_,`F3`,9.5,[.294,.333,.388]));let T=88;for(let e of l(v,58))w.push(d(42,T,e,`F1`,8.5,[.42,.447,.502])),T+=12;w.push(d(42,T,`Telp/WA: ${y}`,`F1`,8.5,[.42,.447,.502]));let E=387.28;w.push(m(E,44,166,18,[.925,.992,.961],[.655,.953,.816],.8)),w.push(p(E,166,56,`FAKTUR PENJUALAN DIGITAL (A4)`,`F2`,8,[.024,.373,.275])),w.push(f(o,76,`Waktu: ${b} WIB`,`F2`,9.5,[.067,.094,.153])),w.push(f(o,90,`Kasir: ${x}`,`F1`,9,[.294,.333,.388]));let D=C?`LUNAS (PAID)`:`ESTIMASI (PRE-BILL)`,O=C?86:112,k=o-O;C?(w.push(m(k,97,O,16,[.82,.98,.898],[.431,.906,.718],.8)),w.push(p(k,O,108,D,`F2`,8,[.024,.373,.275]))):(w.push(m(k,97,O,16,[.996,.953,.78],[.992,.902,.541],.8)),w.push(p(k,O,108,D,`F2`,8,[.471,.208,.059])));let A=Math.max(T+14,124);w.push(h(42,A,o,A,[.067,.094,.153],1.8));let j=A+18;w.push(d(42,j,`DITUJUKAN KEPADA:`,`F2`,8,[.612,.639,.686])),w.push(d(42,j+15,S,`F2`,12.5,[.067,.094,.153]));let M=j+29;if(e.customer_phone&&e.customer_phone!==`-`&&(w.push(d(42,M,`No. WhatsApp: ${e.customer_phone}`,`F1`,9,[.294,.333,.388])),M+=13),e.customer_address&&e.customer_address!==`Toko Fisik / POS Kasir`)for(let t of l(`Alamat Kirim: ${e.customer_address}`,56))w.push(d(42,M,t,`F1`,8.5,[.216,.255,.318])),M+=12;if(e.shipping_courier&&(e.shipping_cost||0)>0&&(w.push(d(42,M,`Ekspedisi: ${e.shipping_courier}`,`F1`,8.5,[.294,.333,.388])),M+=12),e.notes)for(let t of l(`Catatan: ${e.notes}`,60))w.push(d(42,M,t,`F3`,8.5,[.42,.447,.502])),M+=12;w.push(f(o,j,`STATUS DOKUMEN:`,`F2`,8,[.612,.639,.686])),w.push(f(o,j+14,C?`PEMBAYARAN LUNAS`:`MENUNGGU PEMBAYARAN`,`F2`,9.5,C?[.024,.373,.275]:[.573,.251,.055])),w.push(f(o,j+27,`POS Cashier Digital Invoice`,`F1`,8.5,[.42,.447,.502]));let N=Math.max(M+12,j+46),P=398.28,F=549.28;w.push(p(42,28,N,`NO`,`F2`,8,[.294,.333,.388])),w.push(d(76,N,`DESKRIPSI PRODUK & VARIAN`,`F2`,8,[.294,.333,.388])),w.push(f(P,N,`HARGA`,`F2`,8,[.294,.333,.388])),w.push(p(423.28,40,N,`QTY`,`F2`,8,[.294,.333,.388])),w.push(f(F,N,`JUMLAH (IDR)`,`F2`,8,[.294,.333,.388]));let I=N+8;w.push(h(42,I,o,I,[.82,.835,.859],1.3));let L=r(e.items);for(let e=0;e<L.length&&!(I>651.89);e++){let n=L[e];if(n.type===`bundle`){w.push(p(42,28,I+16,String(e+1),`F4`,9,[.42,.447,.502])),w.push(d(76,I+14,c(n.bundleName,44),`F2`,10,[.067,.094,.153]));let r=I+27;n.items.forEach((e,n)=>{let i=t(e.variant_label),o=i&&i!==`Standard`&&i!==`Standar`,s=`ITEM ${n+1}: ${e.product_name}${o?` (${i})`:``} (${e.unit_qty}x @ Rp ${a(e.discounted_line_price)})`;w.push(d(76,r,c(s,58),`F1`,8,[.35,.38,.44])),r+=11}),w.push(f(P,I+18,`Rp ${a(Math.round(n.totalDiscounted/n.bundleQty))}`,`F1`,9.5,[.216,.255,.318])),w.push(p(423.28,40,I+18,`${n.bundleQty}x`,`F2`,9.5,[.067,.094,.153])),w.push(f(F,I+18,`Rp ${a(n.totalDiscounted)}`,`F2`,9.5,[.067,.094,.153])),I=Math.max(I+34,r+6),w.push(h(42,I,o,I,[.898,.906,.922],.7));continue}let r=n.item;w.push(p(42,28,I+16,String(e+1),`F4`,9,[.42,.447,.502])),w.push(d(76,I+14,c(r.product_name,44),`F2`,10,[.067,.094,.153])),w.push(d(76,I+26,`Varian: ${c(t(r.variant_label)||`Standar`,48)}`,`F1`,8.5,[.42,.447,.502])),w.push(f(P,I+19,`Rp ${a(r.price)}`,`F1`,9.5,[.216,.255,.318])),w.push(p(423.28,40,I+19,String(r.quantity),`F2`,9.5,[.067,.094,.153])),w.push(f(F,I+19,`Rp ${a(r.subtotal)}`,`F2`,9.5,[.067,.094,.153])),I+=34,w.push(h(42,I,o,I,[.898,.906,.922],.7))}let R=I+18,z=R;if(e.bank_info||e.qris_instructions){let t=[];e.bank_info&&t.push(...l(`Rekening Bank: ${e.bank_info}`,44)),e.qris_instructions&&t.push(...l(`QRIS: ${e.qris_instructions}`,44));let n=26+t.length*13;w.push(m(42,z,281.204,n,[.976,.98,.984],[.898,.906,.922],.8)),w.push(d(52,z+15,`PETUNJUK PEMBAYARAN TRANSFER / QRIS:`,`F2`,8.5,[.024,.373,.275]));let r=z+29;for(let e of t)w.push(d(52,r,e,`F1`,8.5,[.067,.094,.153])),r+=13;z+=n+14}w.push(m(42,z,148,44,[1,1,1],[.122,.161,.216],1.4)),w.push(p(42,148,z+12,`ALAT KOPI MALANG`,`F2`,7,[.42,.447,.502])),w.push(p(42,148,z+26,C?`* RESMI (LUNAS) *`:`* RESMI (PRE-BILL) *`,`F2`,9.5,[.024,.373,.275])),w.push(p(42,148,z+38,`MALANG - ${b}`,`F4`,6.8,[.612,.639,.686]));let B=1;e.discount_amount>0&&B++,(e.shipping_cost||0)>0&&B++;let V=46+B*16;w.push(m(348.768,R,204.512,V,[.976,.98,.984],[.898,.906,.922],.8));let H=R+18;if(w.push(d(360.768,H,`Subtotal:`,`F1`,9.5,[.294,.333,.388])),w.push(f(541.28,H,`Rp ${a(e.subtotal)}`,`F2`,9.5,[.067,.094,.153])),H+=16,e.discount_amount>0&&(w.push(d(360.768,H,`Potongan Diskon:`,`F1`,9.5,[.016,.471,.341])),w.push(f(541.28,H,`-Rp ${a(e.discount_amount)}`,`F2`,9.5,[.016,.471,.341])),H+=16),(e.shipping_cost||0)>0){let t=`Ongkos Kirim${e.shipping_courier?` (${e.shipping_courier})`:``}:`;w.push(d(360.768,H,c(t,24),`F1`,9.5,[.118,.251,.686])),w.push(f(541.28,H,`Rp ${a(e.shipping_cost||0)}`,`F2`,9.5,[.118,.251,.686])),H+=16}w.push(h(360.768,H-4,541.28,H-4,[.82,.835,.859],1.2)),w.push(d(360.768,H+14,`TOTAL:`,`F2`,10.5,[.067,.094,.153])),w.push(f(541.28,H+15,`Rp ${a(e.total_amount)}`,`F2`,14.5,[.067,.094,.153]));let U=Math.max(z+44+34,R+V+34);w.push(h(42,U,o,U,[.898,.906,.922],.8)),w.push(p(42,511.28,U+16,`Terima kasih telah memesan di Alat Kopi Malang! Dokumen ini adalah faktur digital resmi format A4 yang diterbitkan oleh sistem POS Sanubari.`,`F1`,8,[.612,.639,.686]));let W=w.join(`
`),G=[`<< /Type /Catalog /Pages 2 0 R >>`,`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${n.toFixed(2)} ${i.toFixed(2)}] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R /F4 7 0 R >> >> /Contents 8 0 R >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>`,`<< /Length ${W.length} >>\nstream\n${W}\nendstream`],K=`%PDF-1.4
`,q=[];for(let e=0;e<G.length;e++)q.push(K.length),K+=`${e+1} 0 obj\n${G[e]}\nendobj\n`;let J=K.length,Y=G.length+1;K+=`xref\n0 ${Y}\n0000000000 65535 f \n`;for(let e of q)K+=`${String(e).padStart(10,`0`)} 00000 n \n`;K+=`trailer\n<< /Size ${Y} /Root 1 0 R >>\nstartxref\n${J}\n%%EOF`;let X=new Uint8Array(K.length);for(let e=0;e<K.length;e++)X[e]=K.charCodeAt(e)&255;return X}function Q(e){if(typeof window>`u`)return;let t=`Invoice-Sanubari-Roastery-${(e.customer_name||`Pelanggan`).replace(/[^a-zA-Z0-9_-]/g,`-`).replace(/-+/g,`-`).replace(/^-|-$/g,``)||`Pelanggan`}.pdf`;if((O()||/SanubariPOS-Android|wv|Android/i.test(navigator.userAgent||``))&&navigator.onLine)try{let n=JSON.stringify(e),r=D(new TextEncoder().encode(n)).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``),i=`/pos/download-apk?invoice_pdf=1&payload=${encodeURIComponent(r)}`;if(/SanubariPOS-Android/i.test(navigator.userAgent||``)||O()){window.location.href=i;return}let a=document.createElement(`a`);a.href=i,a.download=t,document.body.appendChild(a),a.click(),document.body.removeChild(a);return}catch{}let n=Z(e),r=new Blob([n],{type:`application/pdf`}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=t,a.style.display=`none`,document.body.appendChild(a),a.click(),document.body.removeChild(a),window.setTimeout(()=>{URL.revokeObjectURL(i)},1e4)}export{V as C,R as D,x as E,N as O,W as S,d as T,k as _,c as a,X as b,z as c,_ as d,A as f,g,O as h,a as i,P as k,H as l,r as m,I as n,q as o,y as p,L as r,J as s,t,M as u,F as v,C as w,K as x,Q as y};