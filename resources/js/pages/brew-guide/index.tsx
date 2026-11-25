import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import {
    Coffee,
    Pause,
    Play,
    RotateCcw,
    Scale,
    Sliders,
    Snowflake,
    Sparkles,
    Sun,
    Volume2,
    VolumeX,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/public-layout';
import type { BrewGuide, Product } from '@/types/sanubari';

export interface BrewPhaseSetting {
    name: string;
    time_range: string;
    end_second: number;
    title: string;
    instruction: string;
}

export interface BrewGuideSettings {
    hero_badge?: string;
    hero_title?: string;
    hero_subtitle?: string;
    mode_v60_label?: string;
    mode_ice_label?: string;

    calc_title?: string;
    calc_subtitle?: string;
    v60_default_grams?: number;
    v60_default_ratio?: number;
    ice_default_grams?: number;
    ice_default_ratio?: number;
    grams_min?: number;
    grams_max?: number;
    ratio_min?: number;
    ratio_max?: number;
    ratio_step?: number;

    grind_size_text?: string;
    v60_temp_text?: string;

    timer_badge?: string;
    v60_timer_title?: string;
    v60_timer_desc?: string;
    v60_target_seconds?: number;
    v60_standby_title?: string;
    v60_standby_instruction?: string;
    v60_completed_title?: string;
    v60_completed_instruction?: string;
    v60_phases?: BrewPhaseSetting[];

    ice_timer_title?: string;
    ice_timer_desc?: string;
    ice_target_seconds?: number;
    ice_standby_title?: string;
    ice_standby_instruction?: string;
    ice_completed_title?: string;
    ice_completed_instruction?: string;
    ice_phases?: BrewPhaseSetting[];

    meta_title?: string;
    meta_description?: string;
}

interface BrewGuideIndexProps {
    guides?: BrewGuide[];
    recommendedBeans?: Product[];
    brewSettings?: BrewGuideSettings | null;
}

type BrewMode = 'v60' | 'japanese_ice';

export default function BrewGuideIndex({
    guides = [],
    recommendedBeans = [],
    brewSettings,
}: BrewGuideIndexProps) {
    const [activeMode, setActiveMode] = useState<BrewMode>('v60');

    // Dosing & Ratio defaults from admin settings
    const defaultV60Grams = Number(brewSettings?.v60_default_grams) || 15;
    const defaultV60Ratio = Number(brewSettings?.v60_default_ratio) || 15;
    const defaultIceGrams = Number(brewSettings?.ice_default_grams) || 18;
    const defaultIceRatio = Number(brewSettings?.ice_default_ratio) || 15;

    // Dosing & Ratio state
    const [coffeeGrams, setCoffeeGrams] = useState<number>(
        activeMode === 'v60' ? defaultV60Grams : defaultIceGrams,
    );
    const [brewRatio, setBrewRatio] = useState<number>(
        activeMode === 'v60' ? defaultV60Ratio : defaultIceRatio,
    );

    // Live Brewing Stopwatch Timer State
    const [timerSeconds, setTimerSeconds] = useState<number>(0);
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
    const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

    const prevPhaseRef = useRef<number>(-1);

    const switchMode = (mode: BrewMode) => {
        setActiveMode(mode);
        setCoffeeGrams(mode === 'v60' ? defaultV60Grams : defaultIceGrams);
        setBrewRatio(mode === 'v60' ? defaultV60Ratio : defaultIceRatio);
        setIsTimerRunning(false);
        setTimerSeconds(0);
        prevPhaseRef.current = -1;
    };

    // Parse presets
    const gramsMin = Number(brewSettings?.grams_min) || 8;
    const gramsMax = Number(brewSettings?.grams_max) || 40;
    const ratioMin = Number(brewSettings?.ratio_min) || 10;
    const ratioMax = Number(brewSettings?.ratio_max) || 20;
    const ratioStep = Number(brewSettings?.ratio_step) || 0.5;

    // Web Audio Synthesizer for gentle notification chimes
    const playChime = (type: 'tick' | 'phase' | 'complete' = 'phase') => {
        if (!soundEnabled || typeof window === 'undefined') return;
        try {
            const AudioContextClass =
                window.AudioContext ||
                (
                    window as unknown as {
                        webkitAudioContext: typeof AudioContext;
                    }
                ).webkitAudioContext;
            if (!AudioContextClass) return;

            const ctx = new AudioContextClass();
            const now = ctx.currentTime;

            if (type === 'complete') {
                // Happy celebratory 3-tone arpeggio (C5 -> E5 -> G5)
                [523.25, 659.25, 783.99].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + i * 0.15);
                    gain.gain.setValueAtTime(0.18, now + i * 0.15);
                    gain.gain.exponentialRampToValueAtTime(
                        0.001,
                        now + i * 0.15 + 0.4,
                    );
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + i * 0.15);
                    osc.stop(now + i * 0.15 + 0.45);
                });
            } else if (type === 'phase') {
                // Gentle dual chime bell (G4 -> C5)
                [392.0, 523.25].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + i * 0.12);
                    gain.gain.setValueAtTime(0.15, now + i * 0.12);
                    gain.gain.exponentialRampToValueAtTime(
                        0.001,
                        now + i * 0.12 + 0.35,
                    );
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + i * 0.12);
                    osc.stop(now + i * 0.12 + 0.4);
                });
            } else {
                // Subtle ticking tap
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.06);
            }
        } catch {
            // Audio context not allowed or unsupported
        }
    };

    // Stopwatch interval effect
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimerSeconds((prev) => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isTimerRunning]);

    const toggleTimer = () => {
        if (!isTimerRunning && timerSeconds === 0) {
            playChime('tick');
        }
        setIsTimerRunning((prev) => !prev);
    };

    const resetTimer = () => {
        setIsTimerRunning(false);
        setTimerSeconds(0);
        prevPhaseRef.current = -1;
    };

    const formatTime = (totalSec: number) => {
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Dynamic Calculations for V60 (40% bloom/acidity, 60% sweetness/balance split into 3 pours)
    const v60TotalWater = Math.round(coffeeGrams * brewRatio);
    const v60BloomWater = Math.round(coffeeGrams * 3); // 1:3 bloom
    const v60RemainingWater = Math.max(0, v60TotalWater - v60BloomWater);
    const v60Pour1Water = Math.round(v60RemainingWater * 0.35);
    const v60Pour2Water = Math.round(v60RemainingWater * 0.35);
    const v60Pour3Water = Math.max(
        0,
        v60RemainingWater - v60Pour1Water - v60Pour2Water,
    );

    // Dynamic Calculations for Japanese Iced Coffee (40% Ice + 60% Hot Water)
    const iceTotalOutput = Math.round(coffeeGrams * brewRatio);
    const iceCubesGram = Math.round(iceTotalOutput * 0.4);
    const iceHotWaterTotal = iceTotalOutput - iceCubesGram;
    const iceBloomWater = Math.round(coffeeGrams * 2.5);
    const iceRemainWater = Math.max(0, iceHotWaterTotal - iceBloomWater);
    const icePour1Water = Math.round(iceRemainWater * 0.55);
    const icePour2Water = Math.max(0, iceRemainWater - icePour1Water);

    // Target total brew time in seconds from admin settings
    const v60TargetSec = Number(brewSettings?.v60_target_seconds) || 180;
    const iceTargetSec = Number(brewSettings?.ice_target_seconds) || 165;
    const totalTargetSeconds =
        activeMode === 'v60' ? v60TargetSec : iceTargetSec;
    const progressPercent = Math.min(
        100,
        Math.round((timerSeconds / totalTargetSeconds) * 100),
    );

    // Active phases list from admin settings or built-in fallback
    const v60PhasesList: BrewPhaseSetting[] =
        brewSettings?.v60_phases && brewSettings.v60_phases.length > 0
            ? brewSettings.v60_phases
            : [
                  {
                      name: 'Blooming',
                      time_range: '0:00 - 0:45',
                      end_second: 45,
                      title: 'Fase 1: Blooming & Pelepasan Gas CO2',
                      instruction: `Tuang ${v60BloomWater} ml air panas secara melingkar dari tengah ke luar. Biarkan mengembang selama 45 detik.`,
                  },
                  {
                      name: 'Tuang 1',
                      time_range: '0:45 - 1:20',
                      end_second: 80,
                      title: 'Fase 2: Tuangan Pertama (Acidity & Sweetness)',
                      instruction: `Tuang perlahan stabil memutar hingga timbangan menyentuh ${v60BloomWater + v60Pour1Water} ml. Senyawa buah mekar sempurna.`,
                  },
                  {
                      name: 'Tuang 2',
                      time_range: '1:20 - 2:00',
                      end_second: 120,
                      title: 'Fase 3: Tuangan Kedua (Body & Caramel Sweetness)',
                      instruction: `Lanjutkan tuangan kedua hingga ${v60BloomWater + v60Pour1Water + v60Pour2Water} ml untuk rasa manis yang tebal dan seimbang.`,
                  },
                  {
                      name: 'Tuang Akhir',
                      time_range: '2:00 - 2:30',
                      end_second: 150,
                      title: 'Fase 4: Tuangan Terakhir (Klaritas Rasa)',
                      instruction: `Selesaikan sisa tuangan air hingga ${v60TotalWater} ml. Lakukan satu kali swirl lembut pada corong V60.`,
                  },
                  {
                      name: 'Akhir & Tiris',
                      time_range: '2:30 - 3:00',
                      end_second: 180,
                      title: 'Fase 5: Drawdown & Penirisan Akhir',
                      instruction:
                          'Biarkan air mengalir tuntas melalui ampas kopi. Angkat dripper saat tetesan air mulai terputus.',
                  },
              ];

    const icePhasesList: BrewPhaseSetting[] =
        brewSettings?.ice_phases && brewSettings.ice_phases.length > 0
            ? brewSettings.ice_phases
            : [
                  {
                      name: 'Bloom 93°C',
                      time_range: '0:00 - 0:40',
                      end_second: 40,
                      title: 'Fase 1: Bloom Suhu Tinggi 93°C',
                      instruction: `Tuang ${iceBloomWater} ml air panas 93°C secara merata. Gas CO2 keluar dan aroma floral mulai terkonsentrasi.`,
                  },
                  {
                      name: 'Flash Chill',
                      time_range: '0:40 - 1:25',
                      end_second: 85,
                      title: 'Fase 2: Flash Chill Extraction',
                      instruction: `Tuangkan ${icePour1Water} ml air panas. Ekstrak kopi panas seketika mendingin di atas es, aroma langsung terkunci.`,
                  },
                  {
                      name: 'Tuang Akhir',
                      time_range: '1:25 - 2:15',
                      end_second: 135,
                      title: 'Fase 3: Tuangan Air Panas Terakhir',
                      instruction: `Selesaikan tuangan sisa air panas hingga timbangan mencapai ${iceHotWaterTotal} ml air panas.`,
                  },
                  {
                      name: 'Swirl Bersama Es',
                      time_range: '2:15 - 2:45',
                      end_second: 165,
                      title: 'Fase 4: Drawdown & Swirl Server Bersama Es',
                      instruction:
                          'Angkat dripper, lalu putar (swirl) server kaca hingga kopi dingin dan es batu mencair sempurna.',
                  },
              ];

    const activePhases = activeMode === 'v60' ? v60PhasesList : icePhasesList;

    // Determine current active phase based on elapsed seconds
    const getCurrentPhaseInfo = () => {
        if (activeMode === 'v60') {
            if (timerSeconds === 0 && !isTimerRunning) {
                return {
                    phaseIndex: -1,
                    title:
                        brewSettings?.v60_standby_title || 'Siap Menyeduh V60',
                    badge: 'Standby',
                    targetWater: `0 / ${v60TotalWater} ml`,
                    instruction:
                        brewSettings?.v60_standby_instruction ||
                        'Ratakan bubuk kopi di dripper. Tekan tombol "Mulai Seduh" saat menuang air blooming pertama.',
                    isComplete: false,
                };
            }

            for (let i = 0; i < v60PhasesList.length; i++) {
                const phase = v60PhasesList[i];
                if (timerSeconds < phase.end_second) {
                    return {
                        phaseIndex: i,
                        title: phase.title,
                        badge: phase.time_range,
                        targetWater: `Target: ${v60TotalWater} ml`,
                        instruction: phase.instruction,
                        isComplete: false,
                    };
                }
            }

            return {
                phaseIndex: v60PhasesList.length,
                title:
                    brewSettings?.v60_completed_title ||
                    '🎉 Seduhan V60 Hangat Selesai!',
                badge: 'Selesai Sempurna',
                targetWater: `${v60TotalWater} ml Hasil Seduhan`,
                instruction:
                    brewSettings?.v60_completed_instruction ||
                    'Goyangkan server kopi agar seluruh ekstraksi bercampur rata. Tuang ke cangkir dan nikmati aromanya!',
                isComplete: true,
            };
        } else {
            // Japanese Ice Mode
            if (timerSeconds === 0 && !isTimerRunning) {
                return {
                    phaseIndex: -1,
                    title:
                        brewSettings?.ice_standby_title ||
                        'Siap Menyeduh Japanese Ice Coffee',
                    badge: 'Standby',
                    targetWater: `0 / ${iceHotWaterTotal} ml air panas`,
                    instruction:
                        brewSettings?.ice_standby_instruction ||
                        `Pastikan ${iceCubesGram}g es batu sudah ada di server. Tekan "Mulai Seduh" saat tuangan air 93°C dimulai.`,
                    isComplete: false,
                };
            }

            for (let i = 0; i < icePhasesList.length; i++) {
                const phase = icePhasesList[i];
                if (timerSeconds < phase.end_second) {
                    return {
                        phaseIndex: i,
                        title: phase.title,
                        badge: phase.time_range,
                        targetWater: `Target Air: ${iceHotWaterTotal} ml`,
                        instruction: phase.instruction,
                        isComplete: false,
                    };
                }
            }

            return {
                phaseIndex: icePhasesList.length,
                title:
                    brewSettings?.ice_completed_title ||
                    '🎉 Japanese Ice Coffee Segar Selesai!',
                badge: 'Selesai Sempurna',
                targetWater: `${iceTotalOutput} ml Dingin Renyah`,
                instruction:
                    brewSettings?.ice_completed_instruction ||
                    'Tuang ke gelas saji yang telah diisi es batu baru. Rasakan ledakan aroma buah dan keasaman renyah alami!',
                isComplete: true,
            };
        }
    };

    const currentPhase = getCurrentPhaseInfo();

    // Trigger chime sound on phase transitions
    useEffect(() => {
        if (!isTimerRunning) return;
        const currentP = currentPhase.phaseIndex;
        if (currentP !== prevPhaseRef.current && currentP >= 0) {
            prevPhaseRef.current = currentP;
            if (currentPhase.isComplete) {
                playChime('complete');
            } else if (currentP > 0) {
                playChime('phase');
            }
        }
    }, [currentPhase.phaseIndex, isTimerRunning, currentPhase.isComplete]);

    const pageTitle =
        brewSettings?.meta_title ||
        'Resep Seduh V60 Pour Over & Japanese Ice Coffee — Alat Kopi Malang';
    const pageDesc =
        brewSettings?.meta_description ||
        'Panduan lengkap dan resep presisi seduh V60 Pour Over hangat dan Japanese Ice Coffee dingin segar dari Alat Kopi Malang. Takaran gramatur, rasio air, suhu, dan timer seduh interaktif.';

    return (
        <PublicLayout title={pageTitle}>
            <Head>
                <meta name="description" content={pageDesc} />
            </Head>

            {/* HERO HEADER SECTION */}
            <div className="border-brand-850 relative overflow-hidden border-b bg-gradient-to-br from-brand-950 via-[#1a2325] to-brand-900 px-4 py-14 text-white sm:px-6 sm:py-20 lg:px-8">
                <div className="pointer-events-none absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-accent-copper/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-sand-300/10 blur-3xl" />

                <div className="relative mx-auto max-w-4xl space-y-5 text-center">
                    {/* Hero Badge Pill */}
                    <div className="flex justify-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-[11px] font-bold tracking-wider text-sand-200 uppercase backdrop-blur-xs sm:text-xs">
                            <Sparkles className="h-3.5 w-3.5 text-accent-copper" />
                            {brewSettings?.hero_badge ||
                                'SANUBARI BREW STUDIO • PANDUAN & TIMER PRESISI'}
                        </span>
                    </div>

                    <h1 className="text-3xl leading-tight font-black tracking-tight sm:text-5xl lg:text-6xl">
                        {brewSettings?.hero_title ? (
                            brewSettings.hero_title
                        ) : (
                            <>
                                Resep Seduh V60 Pour Over &amp;{' '}
                                <span className="font-serif-italic font-normal text-accent-copper italic">
                                    Japanese Ice Coffee
                                </span>
                            </>
                        )}
                    </h1>

                    <p className="mx-auto max-w-2xl text-sm leading-relaxed text-sand-200 sm:text-base">
                        {brewSettings?.hero_subtitle ||
                            'Keluarkan potensi terbaik dari biji kopi specialty lereng Gunung Kawi. Sesuaikan takaran dosis kopi, atur sendiri rasio perbandingan air, dan jalankan timer interaktif langkah demi langkah secara langsung.'}
                    </p>

                    {/* Quick Mode Switcher Pills (Berjejer ke samping di Mobile & Desktop) */}
                    <div className="mx-auto grid w-full max-w-lg grid-cols-2 gap-2 pt-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={() => switchMode('v60')}
                            className={`flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl px-2.5 py-2.5 text-center text-xs font-black shadow-md transition-all duration-200 sm:gap-2 sm:px-5 sm:py-3.5 sm:text-sm ${
                                activeMode === 'v60'
                                    ? 'bg-accent-copper text-white ring-2 shadow-accent-copper/25 ring-accent-copper/50'
                                    : 'border border-white/15 bg-white/10 text-sand-200 hover:bg-white/15'
                            }`}
                        >
                            <Sun className="h-3.5 w-3.5 shrink-0 text-amber-300 sm:h-4 sm:w-4" />
                            <span className="truncate">
                                {brewSettings?.mode_v60_label || (
                                    <>
                                        V60 Pour Over{' '}
                                        <span className="text-[11px] font-normal opacity-85 sm:text-xs">
                                            (Hangat)
                                        </span>
                                    </>
                                )}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => switchMode('japanese_ice')}
                            className={`flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl px-2.5 py-2.5 text-center text-xs font-black shadow-md transition-all duration-200 sm:gap-2 sm:px-5 sm:py-3.5 sm:text-sm ${
                                activeMode === 'japanese_ice'
                                    ? 'bg-sky-600 text-white ring-2 shadow-sky-600/25 ring-sky-400/50'
                                    : 'border border-white/15 bg-white/10 text-sand-200 hover:bg-white/15'
                            }`}
                        >
                            <Snowflake className="h-3.5 w-3.5 shrink-0 text-sky-300 sm:h-4 sm:w-4" />
                            <span className="truncate">
                                {brewSettings?.mode_ice_label || (
                                    <>
                                        Japanese Ice{' '}
                                        <span className="text-[11px] font-normal opacity-85 sm:text-xs">
                                            (Dingin)
                                        </span>
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT CONTAINER */}
            <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
                {/* INTERACTIVE MODE HIGHLIGHT & DOSING / RATIO CALCULATOR */}
                <div className="space-y-4 rounded-2xl border border-sand-200 bg-white p-3.5 shadow-sm sm:space-y-6 sm:rounded-3xl sm:p-6 md:p-8">
                    {/* KALKULATOR TAKARAN & PENGATUR RATIO SENDIRI */}
                    <div className="space-y-4 sm:space-y-5">
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                            <div>
                                <h3 className="flex items-center gap-1.5 text-base font-black text-brand-950 sm:gap-2 sm:text-xl">
                                    <Scale className="h-4 w-4 text-accent-copper sm:h-5 sm:w-5" />
                                    <span>
                                        {brewSettings?.calc_title ||
                                            'Kalkulator Takaran & Rasio Seduh'}
                                    </span>
                                </h3>
                                <p className="text-[11px] text-brand-600 sm:text-xs">
                                    {brewSettings?.calc_subtitle ||
                                        'Geser slider untuk menyesuaikan dosis kopi dan rasio kepekatan air.'}
                                </p>
                            </div>
                            <span className="self-start rounded-full border border-accent-copper/20 bg-accent-copper/10 px-2.5 py-1 text-[10px] font-bold text-accent-copper sm:self-auto sm:text-xs">
                                Rasio Aktif: 1 : {brewRatio}
                            </span>
                        </div>

                        {/* DUAL CONTROLLER GRID: DOSIS KOPI & RATIO AIR */}
                        <div className="grid grid-cols-1 gap-4 rounded-xl border border-sand-200 bg-[#fdfbf9] p-3 sm:gap-6 sm:rounded-2xl sm:p-5 lg:grid-cols-2">
                            {/* Controller 1: Dosis Gramatur Kopi */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-brand-900 uppercase sm:text-xs">
                                        <Coffee className="h-3.5 w-3.5 text-accent-copper" />
                                        <span>Dosis Kopi (Gram)</span>
                                    </label>
                                    <span className="rounded-lg border border-sand-200 bg-white px-2.5 py-0.5 text-xs font-black text-brand-950 shadow-2xs sm:text-sm">
                                        {coffeeGrams} Gram
                                    </span>
                                </div>

                                {/* Slider for Grams */}
                                <input
                                    type="range"
                                    min={gramsMin}
                                    max={gramsMax}
                                    step="1"
                                    value={coffeeGrams}
                                    onChange={(e) =>
                                        setCoffeeGrams(Number(e.target.value))
                                    }
                                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-sand-200 accent-accent-copper"
                                />
                            </div>

                            {/* Controller 2: Rasio Perbandingan Kopi : Air */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-brand-900 uppercase sm:text-xs">
                                        <Sliders className="h-3.5 w-3.5 text-accent-copper" />
                                        <span>
                                            Rasio Seduh (1 : {brewRatio})
                                        </span>
                                    </label>
                                    <span className="rounded-lg border border-sand-200 bg-white px-2.5 py-0.5 text-xs font-black text-brand-950 shadow-2xs sm:text-sm">
                                        1 : {brewRatio}
                                    </span>
                                </div>

                                {/* Slider for Ratio */}
                                <input
                                    type="range"
                                    min={ratioMin}
                                    max={ratioMax}
                                    step={ratioStep}
                                    value={brewRatio}
                                    onChange={(e) =>
                                        setBrewRatio(Number(e.target.value))
                                    }
                                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-sand-200 accent-accent-copper"
                                />
                            </div>
                        </div>

                        {/* Interactive Dynamic Output Cards (Proporsional & Rapi di Mobile) */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
                            {/* Card 1: Dosis Kopi */}
                            <div className="space-y-0.5 rounded-xl border border-sand-200 bg-[#fcfaf7] p-2.5 shadow-2xs sm:space-y-1 sm:rounded-2xl sm:p-3.5">
                                <span className="block truncate text-[9px] font-bold tracking-wider text-brand-500 uppercase sm:text-[10px]">
                                    Dosis Bubuk Kopi
                                </span>
                                <div className="text-lg leading-tight font-black text-brand-950 sm:text-2xl">
                                    {coffeeGrams} g
                                </div>
                                <span className="block truncate text-[9px] text-brand-600 sm:text-[11px]">
                                    {brewSettings?.grind_size_text ||
                                        'Gilingan: Medium-Fine'}
                                </span>
                            </div>

                            {/* Card 2: Takaran Air / Es Batu */}
                            {activeMode === 'v60' ? (
                                <div className="space-y-0.5 rounded-xl border border-sand-200 bg-[#fcfaf7] p-2.5 shadow-2xs sm:space-y-1 sm:rounded-2xl sm:p-3.5">
                                    <span className="block truncate text-[9px] font-bold tracking-wider text-accent-copper uppercase sm:text-[10px]">
                                        Total Air Panas{' '}
                                        {brewSettings?.v60_temp_text ||
                                            '(92–93°C)'}
                                    </span>
                                    <div className="text-lg leading-tight font-black text-brand-950 sm:text-2xl">
                                        {v60TotalWater} ml
                                    </div>
                                    <span className="block truncate text-[9px] text-brand-600 sm:text-[11px]">
                                        Rasio 1:{brewRatio} ({coffeeGrams}g ×{' '}
                                        {brewRatio})
                                    </span>
                                </div>
                            ) : (
                                <div className="space-y-0.5 rounded-xl border border-sky-200 bg-sky-50/70 p-2.5 shadow-2xs sm:space-y-1 sm:rounded-2xl sm:p-3.5">
                                    <span className="block truncate text-[9px] font-bold tracking-wider text-sky-700 uppercase sm:text-[10px]">
                                        Air Panas + Es Batu
                                    </span>
                                    <div className="text-lg leading-tight font-black text-brand-950 sm:text-2xl">
                                        {iceHotWaterTotal} ml{' '}
                                        <span className="text-[10px] font-normal text-sky-800 sm:text-xs">
                                            +{iceCubesGram}g Es
                                        </span>
                                    </div>
                                    <span className="block truncate text-[9px] text-brand-600 sm:text-[11px]">
                                        Total: {iceTotalOutput} ml
                                    </span>
                                </div>
                            )}

                            {/* Card 3: Blooming Water */}
                            <div className="space-y-0.5 rounded-xl border border-sand-200 bg-[#fcfaf7] p-2.5 shadow-2xs sm:space-y-1 sm:rounded-2xl sm:p-3.5">
                                <span className="block truncate text-[9px] font-bold tracking-wider text-brand-500 uppercase sm:text-[10px]">
                                    Air Blooming (Fase 1)
                                </span>
                                <div className="text-lg leading-tight font-black text-brand-950 sm:text-2xl">
                                    {activeMode === 'v60'
                                        ? v60BloomWater
                                        : iceBloomWater}{' '}
                                    ml
                                </div>
                                <span className="block truncate text-[9px] text-brand-600 sm:text-[11px]">
                                    {activeMode === 'v60'
                                        ? 'Durasi 45 detik'
                                        : 'Durasi 40 detik'}
                                </span>
                            </div>

                            {/* Card 4: Target Waktu Ekstraksi */}
                            <div className="space-y-0.5 rounded-xl border border-sand-200 bg-[#fcfaf7] p-2.5 shadow-2xs sm:space-y-1 sm:rounded-2xl sm:p-3.5">
                                <span className="block truncate text-[9px] font-bold tracking-wider text-brand-500 uppercase sm:text-[10px]">
                                    Target Durasi Seduh
                                </span>
                                <div className="text-lg leading-tight font-black text-brand-950 sm:text-2xl">
                                    {formatTime(totalTargetSeconds)}
                                </div>
                                <span className="block truncate text-[9px] text-brand-600 sm:text-[11px]">
                                    Tetesan Terakhir Selesai
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LIVE BREWING STOPWATCH & INTERACTIVE TIMER ASSISTANT */}
                <div className="relative space-y-4 overflow-hidden rounded-2xl border border-brand-800 bg-gradient-to-br from-brand-950 via-[#1b2527] to-brand-900 p-3.5 text-white shadow-xl sm:space-y-6 sm:rounded-3xl sm:p-6 md:p-8">
                    <div className="pointer-events-none absolute top-0 right-0 -mt-24 -mr-24 h-80 w-80 rounded-full bg-accent-copper/15 blur-3xl" />

                    <div className="relative z-10 flex items-start justify-between gap-3 border-b border-white/10 pb-3 sm:items-center sm:pb-5">
                        <div className="space-y-1.5">
                            <span className="inline-block font-mono text-[9px] font-bold tracking-widest text-accent-copper uppercase sm:text-[10px]">
                                {brewSettings?.timer_badge ||
                                    'LIVE BREWING STOPWATCH TIMER'}
                            </span>
                            <h2 className="text-base font-extrabold tracking-tight text-white sm:text-2xl md:text-3xl">
                                {activeMode === 'v60'
                                    ? brewSettings?.v60_timer_title ||
                                      'Timer Asisten Seduh V60 Pour Over'
                                    : brewSettings?.ice_timer_title ||
                                      'Timer Asisten Seduh Japanese Ice Coffee'}
                            </h2>
                            <p className="line-clamp-2 max-w-2xl text-[10px] leading-relaxed text-sand-200 sm:line-clamp-none sm:text-xs md:text-sm">
                                {activeMode === 'v60'
                                    ? brewSettings?.v60_timer_desc ||
                                      'Jalankan timer langsung di browser Anda saat mulai menuang. Notifikasi suara halus dan panduan takaran akan memandu Anda di setiap detik ekstraksi.'
                                    : brewSettings?.ice_timer_desc ||
                                      'Jalankan timer langsung di browser Anda saat mulai menuang. Notifikasi suara halus dan panduan takaran akan memandu Anda di setiap detik ekstraksi.'}
                            </p>
                        </div>

                        {/* Sound Toggle Button */}
                        <div className="shrink-0">
                            <button
                                type="button"
                                onClick={() => setSoundEnabled((prev) => !prev)}
                                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[10px] font-bold transition-all sm:px-3.5 sm:py-2 sm:text-xs ${
                                    soundEnabled
                                        ? 'border-white/25 bg-white/15 text-white hover:bg-white/20'
                                        : 'border-white/10 bg-white/5 text-sand-300 hover:bg-white/10'
                                }`}
                                title="Aktifkan/nonaktifkan notifikasi suara perpindahan fase tuangan"
                            >
                                {soundEnabled ? (
                                    <>
                                        <Volume2 className="h-3.5 w-3.5 text-emerald-400 sm:h-4 sm:w-4" />
                                        <span className="xs:inline hidden">
                                            Bip Suara:
                                        </span>
                                        <span className="text-emerald-300">
                                            Aktif
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <VolumeX className="text-sand-400 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span className="xs:inline hidden">
                                            Bip Suara:
                                        </span>
                                        <span className="text-sand-400">
                                            Hening
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* TIMER DIGITAL DISPLAY & CONTROLS (Horizontal Bar Sesuai Desain Mobile & Desktop) */}
                    <div className="relative z-10 space-y-3 sm:space-y-4">
                        {/* Horizontal Timer Bar Mockup */}
                        <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/15 bg-black/60 px-3 py-3 shadow-inner sm:gap-6 sm:rounded-3xl sm:px-6 sm:py-5">
                            {/* Kiri: WAKTU EKSTRAKSI */}
                            <div className="shrink-0 pl-1 text-left sm:pl-2">
                                <div className="xs:text-xs text-[10px] leading-tight font-black tracking-wider text-white uppercase sm:text-sm">
                                    WAKTU
                                    <br />
                                    EKSTRAKSI
                                </div>
                            </div>

                            {/* Tengah: 00:00 Digital Timer & Target */}
                            <div className="flex flex-1 flex-col items-center justify-center px-1 text-center">
                                <div className="xs:text-4xl font-mono text-3xl leading-none font-black tracking-wider text-accent-copper tabular-nums drop-shadow-md sm:text-5xl md:text-6xl">
                                    {formatTime(timerSeconds)}
                                </div>
                                <div className="xs:text-[11px] mt-1 text-[9px] font-medium tracking-tight whitespace-nowrap text-sand-300 sm:mt-1.5 sm:text-xs">
                                    Target: {formatTime(totalTargetSeconds)} (1:
                                    {brewRatio})
                                </div>
                            </div>

                            {/* Kanan: Tombol START & Reset */}
                            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
                                <button
                                    type="button"
                                    onClick={toggleTimer}
                                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black shadow-md transition-all duration-200 sm:rounded-2xl sm:px-5 sm:py-3 sm:text-sm ${
                                        isTimerRunning
                                            ? 'bg-amber-500 text-brand-950 ring-2 ring-amber-400/50 hover:bg-amber-600'
                                            : 'bg-accent-copper text-white ring-2 ring-accent-copper/40 hover:bg-accent-copper-hover active:scale-95'
                                    }`}
                                >
                                    {isTimerRunning ? (
                                        <>
                                            <Pause className="h-3.5 w-3.5 shrink-0 fill-current sm:h-4 sm:w-4" />
                                            <span>JEDA</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-3.5 w-3.5 shrink-0 fill-current sm:h-4 sm:w-4" />
                                            <span>
                                                {timerSeconds === 0
                                                    ? 'START'
                                                    : 'LANJUT'}
                                            </span>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={resetTimer}
                                    className="shrink-0 cursor-pointer rounded-xl border border-white/15 bg-white/10 p-2 text-sand-200 shadow-sm transition-all hover:bg-white/20 hover:text-white sm:rounded-2xl sm:p-3"
                                    title="Reset Timer ke 00:00"
                                >
                                    <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Card Petunjuk Fase Seduh Aktif & Progres */}
                        <div className="flex flex-col justify-between space-y-3 rounded-2xl border border-white/15 bg-white/5 p-4 sm:space-y-4 sm:rounded-3xl sm:p-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[10px] font-black tracking-wider uppercase sm:px-3 sm:text-xs ${
                                            currentPhase.isComplete
                                                ? 'border border-emerald-400/40 bg-emerald-500/30 text-emerald-300'
                                                : isTimerRunning
                                                  ? 'animate-pulse bg-accent-copper text-white'
                                                  : 'bg-white/10 text-sand-200'
                                        }`}
                                    >
                                        {isTimerRunning
                                            ? '● SEDANG JALAN'
                                            : currentPhase.badge}
                                    </span>

                                    <span className="rounded-lg border border-accent-copper/20 bg-accent-copper/10 px-2.5 py-1 text-xs font-black text-accent-copper sm:text-sm">
                                        {currentPhase.targetWater}
                                    </span>
                                </div>

                                <h3 className="text-base leading-tight font-black text-white sm:text-lg md:text-xl">
                                    {currentPhase.title}
                                </h3>

                                <p className="text-xs leading-relaxed text-sand-200 sm:text-sm">
                                    {currentPhase.instruction}
                                </p>
                            </div>

                            {/* Visual Progress Bar */}
                            <div className="space-y-1.5 pt-1">
                                <div className="flex justify-between font-mono text-xs text-sand-300 sm:text-sm">
                                    <span>Progres: {progressPercent}%</span>
                                    <span>
                                        {timerSeconds >= totalTargetSeconds
                                            ? 'Ekstraksi Selesai'
                                            : `Sisa ${totalTargetSeconds - timerSeconds} detik`}
                                    </span>
                                </div>
                                <div className="h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-white/10 p-0.5 sm:h-3">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            currentPhase.isComplete
                                                ? 'bg-emerald-400'
                                                : 'bg-gradient-to-r from-accent-copper to-amber-300'
                                        }`}
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>

                            {/* Timeline Stage Mini Chips (2 Grid di Mobile, Full Grid di Desktop) */}
                            <div
                                className={`grid grid-cols-2 gap-2.5 pt-2 text-center text-xs sm:gap-3 sm:text-sm ${
                                    activePhases.length === 5
                                        ? 'sm:grid-cols-5'
                                        : activePhases.length === 4
                                          ? 'sm:grid-cols-4'
                                          : 'sm:grid-cols-3'
                                }`}
                            >
                                {activePhases.map((phase, idx) => {
                                    const isActive =
                                        currentPhase.phaseIndex === idx &&
                                        isTimerRunning;
                                    const isPassed =
                                        currentPhase.phaseIndex > idx ||
                                        currentPhase.isComplete;
                                    const isLastOdd =
                                        activePhases.length % 2 === 1 &&
                                        idx === activePhases.length - 1;
                                    return (
                                        <div
                                            key={idx}
                                            className={`rounded-xl border p-3 transition-all sm:p-3.5 ${
                                                isLastOdd
                                                    ? 'col-span-2 sm:col-span-1'
                                                    : ''
                                            } ${
                                                isActive
                                                    ? 'border-accent-copper bg-accent-copper/30 font-bold text-white ring-1 ring-accent-copper/50'
                                                    : isPassed
                                                      ? 'border-white/20 bg-white/10 font-medium text-white'
                                                      : 'border-white/10 bg-white/5 text-sand-200 opacity-85'
                                            }`}
                                        >
                                            <div className="text-sm leading-snug font-bold sm:text-base">
                                                {phase.name}
                                            </div>
                                            <div className="mt-0.5 font-mono text-xs opacity-85 sm:text-xs">
                                                {phase.time_range}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
