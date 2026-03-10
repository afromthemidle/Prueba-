import React, { useMemo, useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { formatCurrency } from '../lib/utils';
import { useLanguage } from '../i18n/LanguageContext';

export interface SunburstNode {
  name: string;
  value?: number;
  children?: SunburstNode[];
}

interface SunburstChartProps {
  data: SunburstNode;
}

export function SunburstChart({ data }: SunburstChartProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; name: string; value: number; percentage: string } | null>(null);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        // Ensure we have a square aspect ratio for the sunburst
        const size = Math.min(width, height);
        setDimensions({ width, height });
      }
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const { paths, totalValue } = useMemo(() => {
    if (!data || !data.children || data.children.length === 0 || dimensions.width === 0 || dimensions.height === 0) {
      return { paths: [], totalValue: 0 };
    }

    const { width, height } = dimensions;
    const radius = Math.min(width, height) / 2;

    // Create a color scale
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

    // Compute the hierarchy
    const hierarchy = d3.hierarchy(data)
      .sum(d => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Compute the partition layout
    const root = d3.partition<SunburstNode>().size([2 * Math.PI, radius])(hierarchy);
    
    const totalValue = root.value || 0;

    // Create the arc generator
    const arc = d3.arc<d3.HierarchyRectangularNode<SunburstNode>>()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius / 2)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1 - 1);

    // Generate paths for all descendants except the root
    const paths = root.descendants().filter(d => d.depth > 0).map((node, i) => {
      // Color based on the top-level category (Country)
      let ancestor = node;
      while (ancestor.depth > 1 && ancestor.parent) {
        ancestor = ancestor.parent;
      }
      
      // Slightly adjust lightness based on depth to distinguish levels
      const baseColor = d3.hsl(color(ancestor.data.name));
      baseColor.l += (node.depth - 1) * 0.08; // Lighter as it goes deeper
      const fill = baseColor.toString();

      return {
        id: `${node.data.name}-${i}`,
        d: arc(node) || '',
        fill,
        name: node.data.name,
        value: node.value || 0,
        depth: node.depth
      };
    });

    return { paths, totalValue };
  }, [data, dimensions]);

  if (paths.length === 0) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
        {t("Not enough data to display the chart.")}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center" onMouseLeave={() => setTooltip(null)}>
      <svg 
        width={dimensions.width} 
        height={dimensions.height} 
        viewBox={`${-dimensions.width / 2} ${-dimensions.height / 2} ${dimensions.width} ${dimensions.height}`} 
        className="max-w-full h-auto font-sans"
      >
        {paths.map((p) => (
          <path
            key={p.id}
            d={p.d}
            fill={p.fill}
            fillOpacity={0.8}
            stroke="#ffffff"
            strokeWidth={1.5}
            className="transition-all duration-200 hover:fill-opacity-100 cursor-pointer"
            onMouseEnter={(e) => {
              const percentage = totalValue > 0 ? ((p.value / totalValue) * 100).toFixed(1) : '0';
              setTooltip({
                visible: true,
                x: e.clientX,
                y: e.clientY,
                name: p.name,
                value: p.value,
                percentage
              });
            }}
            onMouseMove={(e) => {
              setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
            }}
          />
        ))}
        {/* Center text */}
        <text textAnchor="middle" fill="#64748b" fontSize="12" dy="-0.5em" className="pointer-events-none select-none">{t("Total")}</text>
        <text textAnchor="middle" fill="#0f172a" fontSize="16" fontWeight="bold" dy="1em" className="pointer-events-none select-none">{formatCurrency(totalValue)}</text>
      </svg>

      {tooltip && tooltip.visible && (
        <div 
          className="fixed z-50 bg-white p-3 border border-slate-200 shadow-xl rounded-xl pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-15px] min-w-[150px]"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <p className="font-semibold text-slate-900 text-sm">{t(tooltip.name)}</p>
          <div className="flex items-center justify-between gap-4 mt-1.5">
            <p className="text-indigo-600 font-mono font-semibold text-sm">{formatCurrency(tooltip.value)}</p>
            <p className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">{tooltip.percentage}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
