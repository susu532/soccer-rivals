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

export const initPoki = async () => {
    // Check if we are running locally in dev mode without SDK script
    if (import.meta.env.DEV && !(window as any).PokiSDK) {
        return;
    }

    const sdk = (window as any).PokiSDK;
    if (sdk) {
        try {
            await sdk.init();
            console.log("Poki SDK successfully initialized");
        } catch (e) {
            console.log("Poki SDK initialized, but the user likely has adblock", e);
        }
    }
};

// Poki doesn't have an exact "Happy Time" API like CrazyGames,
// but we leave this stub in case we want to hook it to analytics later.
export const triggerHappyMoment = () => {
    // No-op for Poki
};

export const requestAd = async (type: 'midgame' | 'rewarded'): Promise<boolean> => {
    const sdk = (window as any).PokiSDK;
    if (!sdk) {
        console.warn(`Poki SDK not found. Skipping ${type} ad.`);
        return type === 'rewarded'; // If no SDK, just grant reward locally
    }

    const currentVolume = useGameStore.getState().settings.volume;

    try {
        // Pause gameplay tracking and audio
        sdk.gameplayStop();
        soundManager.setVolume(0);
        
        let success = true;
        if (type === 'rewarded') {
            success = await sdk.rewardedBreak();
        } else {
            await sdk.commercialBreak();
        }
        return success;
    } catch (error) {
        console.error('Poki Ad Error/Complete:', error);
        return false;
    } finally {
        // Resume gameplay tracking and audio
        sdk.gameplayStart();
        soundManager.setVolume(currentVolume);
    }
};

/**
 * @copyright 2026 hentertrabelsi - All Rights Reserved
 */
