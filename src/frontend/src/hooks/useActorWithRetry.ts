import { useState, useCallback } from 'react';
import { useActor } from './useActor';

const ACTOR_INIT_TIMEOUT = 15000; // 15 seconds timeout

export function useActorWithRetry() {
    const [retryCount, setRetryCount] = useState(0);
    const [timeoutError, setTimeoutError] = useState<Error | null>(null);
    const [isTimedOut, setIsTimedOut] = useState(false);
    
    const { actor, isFetching } = useActor();

    // Set up timeout detection
    useState(() => {
        if (isFetching && !actor) {
            const timeoutId = setTimeout(() => {
                if (!actor && isFetching) {
                    setIsTimedOut(true);
                    setTimeoutError(new Error('Actor initialization timed out after 15 seconds'));
                }
            }, ACTOR_INIT_TIMEOUT);

            return () => clearTimeout(timeoutId);
        } else if (actor) {
            setIsTimedOut(false);
            setTimeoutError(null);
        }
    });

    // Retry function that forces a page reload to reinitialize
    const retryActorInit = useCallback(() => {
        setRetryCount(prev => prev + 1);
        setIsTimedOut(false);
        setTimeoutError(null);
        // Force page reload to reinitialize actor
        window.location.reload();
    }, []);

    return {
        actor,
        isFetching,
        isError: isTimedOut,
        error: timeoutError,
        retryActorInit,
        retryCount
    };
}
