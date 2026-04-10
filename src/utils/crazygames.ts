/**
 * @copyright 2026 hentertrabelsi
 * @contact Email: hentertrabelsi@gmail.com
 * @discord #susuxo
 * 
 * All rights reserved. This software is proprietary and confidential.
 * You may not use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software without explicit permission.
 */

import { soundManager } from './audio';
import { useGameStore } from '../store';

export const initCrazyGames = async () => {
    // Check if we are running locally in dev mode without SDK script
    if (import.meta.env.DEV && !(window as any).CrazyGames) {
        return;
    }

    const sdk = (window as any).CrazyGames?.SDK;
    if (sdk) {
        try {
            await sdk.init();
            console.log("CrazyGames SDK initialized");
        } catch (e) {
            console.error("CrazyGames SDK init failed", e);
        }
    }
};

export const triggerHappyMoment = () => {
    const sdk = (window as any).CrazyGames?.SDK;
    if (sdk?.game) {
        try {
            sdk.game.happytime();
        } catch (e) {
            console.error('Error triggering happy moment:', e);
        }
    }
};

export const requestAd = async (type: 'midgame' | 'rewarded') => {
    const sdk = (window as any).CrazyGames?.SDK;
    if (!sdk?.ad) {
        console.warn(`CrazyGames SDK not found. Skipping ${type} ad.`);
        return; // SDK not present
    }

    const currentVolume = useGameStore.getState().settings.volume;

    try {
        // Pause gameplay tracking and audio
        sdk.game?.gameplayStop?.();
        soundManager.setVolume(0);
        
        await sdk.ad.requestAd(type);
    } catch (error) {
        console.error('CrazyGames Ad Error/Complete:', error);
    } finally {
        // Resume gameplay tracking and audio
        sdk.game?.gameplayStart?.();
        soundManager.setVolume(currentVolume);
    }
};

/**
 * @copyright 2026 hentertrabelsi - All Rights Reserved
 */
