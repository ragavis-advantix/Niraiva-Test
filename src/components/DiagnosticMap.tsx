import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { DiagnosticNode } from '@/utils/healthData';
import { useIsMobile } from '@/hooks/use-mobile';

interface DiagnosticMapProps {
  nodes: DiagnosticNode[];
  className?: string;
}

export function DiagnosticMap({ nodes, className }: DiagnosticMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [activeNode, setActiveNode] = useState<DiagnosticNode | null>(null);
  const [viewBox, setViewBox] = useState('0 0 1000 1000');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });
  const [pinchDistance, setPinchDistance] = useState<number | null>(null);
  const [lastZoom, setLastZoom] = useState(1);
  const [initialTouchPosition, setInitialTouchPosition] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const [pinchFingerRemoved, setPinchFingerRemoved] = useState(false);
  const isMobile = useIsMobile();

  const getNodePosition = useCallback((node: DiagnosticNode) => {
    const baseX = 150 + node.x * 250;
    const baseY = 100 + node.y * 150;
    return { x: baseX, y: baseY };
  }, []);

  const sortedNodes = [...nodes].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const updateViewBox = useCallback(() => {
    if (sortedNodes.length === 0 || !svgRef.current) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    sortedNodes.forEach(node => {
      const pos = getNodePosition(node);
      minX = Math.min(minX, pos.x - 100);
      maxX = Math.max(maxX, pos.x + 100);
      minY = Math.min(minY, pos.y - 50);
      maxY = Math.max(maxY, pos.y + 100);
    });

    const width = maxX - minX + 200;
    const height = maxY - minY + 200;

    const newPan = { x: minX - 100, y: minY - 100 };
    const newViewBox = `${minX - 100} ${minY - 100} ${width} ${height}`;

    setPan(prevPan => {
      if (JSON.stringify(prevPan) !== JSON.stringify(newPan)) {
        return newPan;
      }
      return prevPan;
    });

    setViewBox(prevViewBox => {
      if (prevViewBox !== newViewBox) {
        return newViewBox;
      }
      return prevViewBox;
    });
  }, [sortedNodes, getNodePosition]);

  useEffect(() => {
    updateViewBox();
  }, [updateViewBox]);

  const getNodeColor = (nodeType: string) => {
    switch (nodeType.toLowerCase()) {
      case 'initial':
        return "#A7F3D0";
      case 'terminal':
        return "#D1FAE5";
      case 'symptoms':
        return "#FEE2E2";
      case 'treatment':
        return "#FEF3C7";
      case 'care':
        return "#DBEAFE";
      case 'diagnosis':
        return "#E5E7EB";
      default:
        return "#F3F4F6";
    }
  };

  // Function to get connection color based on the type of connection
  const getConnectionColor = (sourceNode: DiagnosticNode, targetNode: DiagnosticNode) => {
    // Find connection type from source and target nodes
    const sourceType = sourceNode.title.toLowerCase();
    const targetType = targetNode.title.toLowerCase();

    if (sourceType.includes('symptom') || targetType.includes('symptom')) {
      return "#F97316"; // Orange for symptom connections
    } else if (sourceType.includes('treatment') || targetType.includes('treatment') ||
      sourceType.includes('medication') || targetType.includes('medication')) {
      return "#10B981"; // Green for treatment connections
    } else if (sourceType.includes('care') || targetType.includes('care')) {
      return "#0EA5E9"; // Blue for care connections
    } else if (sourceType.includes('diagnosis') || targetType.includes('diagnosis')) {
      return "#8B5CF6"; // Purple for diagnosis connections
    } else if (sourceType.includes('recovery') || targetType.includes('recovery')) {
      return "#06B6D4"; // Teal for recovery connections
    } else {
      return "#9CA3AF"; // Default gray
    }
  };

  const getConnectionPath = (sourceNode: DiagnosticNode, targetNode: DiagnosticNode) => {
    const sourcePos = getNodePosition(sourceNode);
    const targetPos = getNodePosition(targetNode);

    return `M${sourcePos.x},${sourcePos.y} 
            Q${(sourcePos.x + targetPos.x) / 2},${(sourcePos.y + targetPos.y) / 2 - 30} 
            ${targetPos.x},${targetPos.y}`;
  };

  const calculateZoomAndPan = useCallback((centerX: number, centerY: number, newZoom: number, curZoom: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();

      // Convert screen coordinates to SVG coordinates
      const svgX = ((centerX - rect.left) / rect.width) * 1000 / curZoom + pan.x;
      const svgY = ((centerY - rect.top) / rect.height) * 1000 / curZoom + pan.y;

      // Calculate new pan to maintain the cursor position
      const newPanX = svgX - ((centerX - rect.left) / rect.width) * 1000 / newZoom;
      const newPanY = svgY - ((centerY - rect.top) / rect.height) * 1000 / newZoom;

      return { newPanX, newPanY };
    }
    return { newPanX: pan.x, newPanY: pan.y };
  }, [pan]);

  const zoomIn = useCallback((centerX?: number, centerY?: number) => {
    const newZoom = Math.min(zoom + 0.2, 3);

    if (centerX !== undefined && centerY !== undefined) {
      const { newPanX, newPanY } = calculateZoomAndPan(centerX, centerY, newZoom, zoom);

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    } else if (containerRef.current) {
      // Default to center of container if no coordinates provided
      const rect = containerRef.current.getBoundingClientRect();
      const centerOfContainerX = rect.width / 2;
      const centerOfContainerY = rect.height / 2;

      const { newPanX, newPanY } = calculateZoomAndPan(centerOfContainerX, centerOfContainerY, newZoom, zoom);

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    } else {
      setZoom(newZoom);
    }
  }, [zoom, calculateZoomAndPan]);

  const zoomOut = useCallback((centerX?: number, centerY?: number) => {
    const newZoom = Math.max(zoom - 0.2, 0.3);

    if (centerX !== undefined && centerY !== undefined) {
      const { newPanX, newPanY } = calculateZoomAndPan(centerX, centerY, newZoom, zoom);

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    } else if (containerRef.current) {
      // Default to center of container if no coordinates provided
      const rect = containerRef.current.getBoundingClientRect();
      const centerOfContainerX = rect.width / 2;
      const centerOfContainerY = rect.height / 2;

      const { newPanX, newPanY } = calculateZoomAndPan(centerOfContainerX, centerOfContainerY, newZoom, zoom);

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    } else {
      setZoom(newZoom);
    }
  }, [zoom, calculateZoomAndPan]);

  const resetView = useCallback(() => {
    if (sortedNodes.length > 0) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

      sortedNodes.forEach(node => {
        const pos = getNodePosition(node);
        minX = Math.min(minX, pos.x - 100);
        maxX = Math.max(maxX, pos.x + 100);
        minY = Math.min(minY, pos.y - 50);
        maxY = Math.max(maxY, pos.y + 100);
      });

      const width = maxX - minX + 200;
      const height = maxY - minY + 200;

      setZoom(1);
      setPan({ x: minX - 100, y: minY - 100 });
      setViewBox(`${minX - 100} ${minY - 100} ${width} ${height}`);
    }
  }, [sortedNodes]);

  const getTouchDistance = (e: React.TouchEvent) => {
    if (e.touches.length < 2) return null;

    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setInitialTouchPosition({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
      setDragStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
      setLastPan({ ...pan });
      setPinchFingerRemoved(false);
      setTimeout(() => {
        setIsPinching(false);
      }, 50);
    } else if (e.touches.length === 2) {
      setIsPinching(true);
      setIsDragging(false);
      const distance = getTouchDistance(e);
      setPinchDistance(distance);
      setLastZoom(zoom);
      setPinchFingerRemoved(false);
    }
  }, [pan, zoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1 && (!isPinching || pinchFingerRemoved)) {
      e.preventDefault();

      const dx = (e.touches[0].clientX - dragStart.x) / zoom;
      const dy = (e.touches[0].clientY - dragStart.y) / zoom;

      setPan({
        x: lastPan.x - dx,
        y: lastPan.y - dy
      });
    } else if (e.touches.length === 2) {
      e.preventDefault();
      setIsPinching(true);

      const newDistance = getTouchDistance(e);
      if (newDistance === null) return;

      const scaleFactor = newDistance / (pinchDistance || 1);
      const newZoom = Math.max(0.3, Math.min(3, lastZoom * scaleFactor));

      // Get center point between the two fingers
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      if (containerRef.current) {
        const { newPanX, newPanY } = calculateZoomAndPan(centerX, centerY, newZoom, lastZoom);

        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
      }
    }
  }, [isDragging, dragStart, lastPan, zoom, pinchDistance, lastZoom, pan, isPinching, pinchFingerRemoved, calculateZoomAndPan]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      // All fingers removed
      if (isPinching) {
        setPinchFingerRemoved(true);
      }

      setTimeout(() => {
        setIsDragging(false);
        setIsPinching(false);
      }, 100);

    } else if (e.touches.length === 1 && isPinching) {
      // One finger left after pinching
      setPinchFingerRemoved(true);

      // Update the drag start for subsequent panning
      setDragStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
      setLastPan({ ...pan });

      setTimeout(() => {
        setIsPinching(false);
      }, 100);
    }

    setPinchDistance(null);
  }, [isPinching, pan]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLastPan({ ...pan });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = (e.clientX - dragStart.x) / zoom;
    const dy = (e.clientY - dragStart.y) / zoom;

    setPan({
      x: lastPan.x - dx,
      y: lastPan.y - dy
    });
  }, [isDragging, dragStart, lastPan, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const { deltaY, clientX, clientY } = e;

    // Get the cursor position relative to the SVG element
    if (deltaY > 0) {
      zoomOut(clientX, clientY);
    } else {
      zoomIn(clientX, clientY);
    }
  }, [zoomIn, zoomOut]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    zoomIn(e.clientX, e.clientY);
  }, [zoomIn]);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 1000 / zoom;
    const height = 1000 / zoom;

    setViewBox(`${pan.x} ${pan.y} ${width} ${height}`);
  }, [zoom, pan]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventDefaultTouchMove = (e: TouchEvent) => {
      if (isDragging || isPinching || e.touches.length === 2) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchmove', preventDefaultTouchMove, { passive: false });

    return () => {
      container.removeEventListener('touchmove', preventDefaultTouchMove);
    };
  }, [isDragging, isPinching]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="glass-panel p-4 rounded-xl overflow-hidden">
        <div className="absolute top-6 right-6 z-10 flex space-x-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => zoomIn()}
            className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => zoomOut()}
            className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={resetView}
            className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
            aria-label="Reset view"
          >
            <Maximize2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </motion.button>
        </div>

        <div
          className="w-full h-[700px] relative touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
        >
          <svg
            ref={svgRef}
            viewBox={viewBox}
            className="w-full h-full bg-gray-50 dark:bg-gray-900 rounded-lg"
            style={{
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          >
            <defs>
              {/* Define markers with different colors */}
              <marker
                id="arrowhead-default"
                markerWidth="10"
                markerHeight="7"
                refX="7"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 7 3.5, 0 7"
                  fill="#9CA3AF"
                />
              </marker>
              <marker
                id="arrowhead-symptom"
                markerWidth="10"
                markerHeight="7"
                refX="7"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 7 3.5, 0 7"
                  fill="#F97316"
                />
              </marker>
              <marker
                id="arrowhead-treatment"
                markerWidth="10"
                markerHeight="7"
                refX="7"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 7 3.5, 0 7"
                  fill="#10B981"
                />
              </marker>
              <marker
                id="arrowhead-care"
                markerWidth="10"
                markerHeight="7"
                refX="7"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 7 3.5, 0 7"
                  fill="#0EA5E9"
                />
              </marker>
              <marker
                id="arrowhead-diagnosis"
                markerWidth="10"
                markerHeight="7"
                refX="7"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 7 3.5, 0 7"
                  fill="#8B5CF6"
                />
              </marker>
              <marker
                id="arrowhead-recovery"
                markerWidth="10"
                markerHeight="7"
                refX="7"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 7 3.5, 0 7"
                  fill="#06B6D4"
                />
              </marker>

              {/* Define gradients for prettier connections */}
              <linearGradient id="gradient-symptom" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F97316" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#F97316" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="gradient-treatment" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="gradient-care" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="gradient-diagnosis" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="gradient-recovery" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {sortedNodes.map(node => {
              return node.connections.map(targetId => {
                const targetNode = sortedNodes.find(n => n.id === targetId);
                if (!targetNode) return null;

                const connectionPath = getConnectionPath(node, targetNode);
                const connectionColor = getConnectionColor(node, targetNode);
                let markerEnd = "url(#arrowhead-default)";
                let gradientUrl = "";

                // Set appropriate marker and gradient based on connection type
                if (connectionColor === "#F97316") {
                  markerEnd = "url(#arrowhead-symptom)";
                  gradientUrl = "url(#gradient-symptom)";
                } else if (connectionColor === "#10B981") {
                  markerEnd = "url(#arrowhead-treatment)";
                  gradientUrl = "url(#gradient-treatment)";
                } else if (connectionColor === "#0EA5E9") {
                  markerEnd = "url(#arrowhead-care)";
                  gradientUrl = "url(#gradient-care)";
                } else if (connectionColor === "#8B5CF6") {
                  markerEnd = "url(#arrowhead-diagnosis)";
                  gradientUrl = "url(#gradient-diagnosis)";
                } else if (connectionColor === "#06B6D4") {
                  markerEnd = "url(#arrowhead-recovery)";
                  gradientUrl = "url(#gradient-recovery)";
                }

                return (
                  <path
                    key={`${node.id}-${targetId}`}
                    d={connectionPath}
                    stroke={connectionColor}
                    strokeWidth="2"
                    strokeDasharray={gradientUrl ? "none" : "5,5"}
                    fill="none"
                    markerEnd={markerEnd}
                    style={{
                      stroke: gradientUrl || connectionColor,
                      filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.1))"
                    }}
                  />
                );
              });
            })}

            {sortedNodes.map(node => {
              const pos = getNodePosition(node);
              const nodeType = node.title.toLowerCase().includes('symptom') ? 'symptoms' :
                node.title.toLowerCase().includes('treatment') || node.title.toLowerCase().includes('medication') ? 'treatment' :
                  node.title.toLowerCase().includes('care') ? 'care' :
                    node.title.toLowerCase().includes('recovery') ? 'terminal' :
                      node.id === "terminal" ? 'terminal' :
                        node.id.startsWith('init') ? 'initial' : 'diagnosis';

              const nodeColor = getNodeColor(nodeType);
              const nodeWidth = 180;
              const nodeHeight = 70;
              const hasParameters = node.parameters.length > 0;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x - nodeWidth / 2}, ${pos.y - nodeHeight / 2})`}
                  onClick={() => setActiveNode(activeNode?.id === node.id ? null : node)}
                  className="cursor-pointer"
                >
                  <rect
                    x="0"
                    y="0"
                    width={nodeWidth}
                    height={nodeHeight}
                    rx="15"
                    ry="15"
                    fill={nodeColor}
                    stroke={activeNode?.id === node.id ? "#3B82F6" : "#9CA3AF"}
                    strokeWidth={activeNode?.id === node.id ? "2" : "1"}
                    filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.1))"
                  />

                  <text
                    x={nodeWidth / 2}
                    y={hasParameters ? 25 : 40}
                    textAnchor="middle"
                    className="fill-gray-900 dark:fill-gray-900 text-sm font-medium"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.title}
                  </text>

                  {hasParameters && (
                    <text
                      x={nodeWidth / 2}
                      y={48}
                      textAnchor="middle"
                      className="fill-gray-600 dark:fill-gray-600 text-xs"
                      style={{ pointerEvents: 'none' }}
                    >
                      {`Type: ${node.parameters[0].value || 'Unknown'}`}
                    </text>
                  )}
                </g>
              );
            })}

            {(() => {
              const sortedNodesLength = sortedNodes.length;
              if (sortedNodesLength === 0) return null;

              let centerX = 0, centerY = 0;
              sortedNodes.forEach(node => {
                const pos = getNodePosition(node);
                centerX += pos.x;
                centerY += pos.y;
              });
              centerX /= sortedNodesLength;
              centerY /= sortedNodesLength;

              const conditionName = sortedNodes[0].title.split(' ')[0];

              return (
                <g
                  transform={`translate(${centerX - 50}, ${centerY - 50})`}
                  className="cursor-pointer"
                >
                  <rect
                    x="0"
                    y="0"
                    width="100"
                    height="100"
                    rx="10"
                    ry="10"
                    fill="#D1D5DB"
                    stroke="#9CA3AF"
                    strokeWidth="1"
                    filter="drop-shadow(0px 3px 5px rgba(0,0,0,0.15))"
                  />
                  <text
                    x="50"
                    y="55"
                    textAnchor="middle"
                    className="fill-gray-900 dark:fill-gray-900 text-sm font-medium"
                    style={{ pointerEvents: 'none' }}
                  >
                    {conditionName}
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        {isMobile && (
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-xs text-gray-600 dark:text-gray-300">
            <p className="text-center">
              <span className="font-medium">Tip:</span> Use two fingers to pinch zoom at any point. You can pan with one finger after zooming. Double tap to zoom in.
            </p>
          </div>
        )}

        {activeNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 glass-card p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{activeNode.title}</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(activeNode.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">{activeNode.description}</p>

            {activeNode.parameters.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Details:</h4>
                <div className="space-y-2">
                  {activeNode.parameters.map(param => (
                    <div key={param.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-gray-700 dark:text-gray-300">{param.name}</span>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 dark:text-white">{param.value}</span>
                        {param.unit && (
                          <span className="ml-1 text-gray-500 dark:text-gray-400 text-xs">{param.unit}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
