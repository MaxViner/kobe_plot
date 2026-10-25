import { useCallback, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { VIEWBOX_HEIGHT, VIEWBOX_WIDTH } from './useSceneFit.js';

const MIN_SCALE = 0.4;
const MAX_SCALE = 30;
const WHEEL_SENSITIVITY = 0.25;

export function useSceneZoom() {
  const svgRef = useRef(null);
  const zoomGroupRef = useRef(null);
  const zoomBehaviorRef = useRef(null);

  useEffect(() => {
    const svgElement = svgRef.current;
    const zoomGroupElement = zoomGroupRef.current;

    if (!svgElement || !zoomGroupElement) {
      return undefined;
    }

    const svg = d3.select(svgElement);
    const zoomGroup = d3.select(zoomGroupElement);

    const zoom = d3
      .zoom()
      .scaleExtent([MIN_SCALE, MAX_SCALE])
      .extent([
        [0, 0],
        [VIEWBOX_WIDTH, VIEWBOX_HEIGHT],
      ])
      .wheelDelta((event) => {
        const direction = event.deltaY > 0 ? -1 : 1;
        return direction * WHEEL_SENSITIVITY;
      })
      .on('zoom', (event) => {
        zoomGroup.attr('transform', event.transform.toString());
      });

    zoomBehaviorRef.current = zoom;

    svg.call(zoom).on('dblclick.zoom', null);

    return () => {
      svg.on('.zoom', null);
      zoomBehaviorRef.current = null;
    };
  }, []);

  const zoomByFactor = useCallback((factor) => {
    const svg = d3.select(svgRef.current);
    const zoom = zoomBehaviorRef.current;

    if (!svg.node() || !zoom) {
      return;
    }

    svg.transition().duration(180).call(zoom.scaleBy, factor);
  }, []);

  const resetView = useCallback(() => {
    const svg = d3.select(svgRef.current);
    const zoom = zoomBehaviorRef.current;

    if (!svg.node() || !zoom) {
      return;
    }

    svg
      .transition()
      .duration(220)
      .call(zoom.transform, d3.zoomIdentity);
  }, []);

  const focusPoint = useCallback((point, scale = 8) => {
    const svg = d3.select(svgRef.current);
    const zoom = zoomBehaviorRef.current;

    if (!svg.node() || !zoom) {
      return;
    }

    svg
      .transition()
      .duration(320)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(VIEWBOX_WIDTH / 2, VIEWBOX_HEIGHT / 2)
          .scale(scale)
          .translate(-point.x, -point.y),
      );
  }, []);

  return {
    svgRef,
    zoomGroupRef,
    zoomByFactor,
    resetView,
    focusPoint,
  };
}