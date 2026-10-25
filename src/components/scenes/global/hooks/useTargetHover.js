import { useCallback, useState } from 'react';

export function useTargetHover() {
  const [internalHoveredTargetId, setInternalHoveredTargetId] =
    useState(null);

  const handleMouseEnter = useCallback((targetId) => {
    setInternalHoveredTargetId(targetId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setInternalHoveredTargetId(null);
  }, []);

  return {
    internalHoveredTargetId,
    handleMouseEnter,
    handleMouseLeave,
  };
}