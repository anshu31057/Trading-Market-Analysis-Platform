import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Customized,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const assetConfig = [
  { key: "stocks", label: "Stocks", color: "#2563eb" },
  { key: "bonds", label: "Bonds", color: "#16a34a" },
  { key: "crypto", label: "Crypto", color: "#f97316" },
];

const chartTypes = [
  { value: "line", label: "Line" },
  { value: "bar", label: "Bar" },
  { value: "candlestick", label: "Candlestick" },
];

const randomBetween = (min, max) =>
  Math.round((Math.random() * (max - min) + min) * 100) / 100;

const buildCandles = (price) => {
  const open = randomBetween(price - 4, price + 4);
  const close = randomBetween(price - 4, price + 4);
  const high = Math.max(open, close) + randomBetween(0, 6);
  const low = Math.min(open, close) - randomBetween(0, 6);
  return { open, close, high, low };
};

const buildInitialSeries = () =>
  Array.from({ length: 12 }).map((_, index) => {
    const stocks = randomBetween(180, 240);
    const bonds = randomBetween(90, 120);
    const crypto = randomBetween(22000, 26000);
    return {
      time: `T-${12 - index}`,
      stocks,
      bonds,
      crypto,
      stocksCandle: buildCandles(stocks),
      bondsCandle: buildCandles(bonds),
      cryptoCandle: buildCandles(crypto),
    };
  });

const updateSeries = (previous) => {
  const next = previous.slice(1);
  const last = previous[previous.length - 1];
  const stocks = randomBetween(last.stocks - 5, last.stocks + 5);
  const bonds = randomBetween(last.bonds - 2, last.bonds + 2);
  const crypto = randomBetween(last.crypto - 400, last.crypto + 400);
  next.push({
    time: `T-${parseInt(last.time.replace("T-", ""), 10) + 1}`,
    stocks,
    bonds,
    crypto,
    stocksCandle: buildCandles(stocks),
    bondsCandle: buildCandles(bonds),
    cryptoCandle: buildCandles(crypto),
  });
  return next;
};

const CandleLayer = ({ points, yAxisMap, visibleAssets }) => {
  const yScale = Object.values(yAxisMap || {})[0]?.scale;
  if (!yScale) return null;

  return (
    <g>
      {points.map((entry) =>
        assetConfig.map((asset, assetIndex) => {
          if (!visibleAssets[asset.key]) return null;
          const candle = entry[`${asset.key}Candle`];
          const band = 40;
          const offset = assetIndex * (band / assetConfig.length) - band / 3;
          const cx = entry.__x + offset;
          const open = yScale(candle.open);
          const close = yScale(candle.close);
          const high = yScale(candle.high);
          const low = yScale(candle.low);
          const isUp = candle.close >= candle.open;
          const candleColor = isUp ? asset.color : "#ef4444";
          return (
            <g key={`${entry.time}-${asset.key}`}>
              <line
                x1={cx}
                x2={cx}
                y1={high}
                y2={low}
                stroke={candleColor}
                strokeWidth={2}
              />
              <rect
                x={cx - 6}
                y={Math.min(open, close)}
                width={12}
                height={Math.max(8, Math.abs(close - open))}
                fill={candleColor}
                rx={2}
              />
            </g>
          );
        })
      )}
    </g>
  );
};

const buildLegendPayload = (visibleAssets, onToggle) =>
  assetConfig.map((asset) => ({
    value: asset.label,
    id: asset.key,
    color: asset.color,
    type: "line",
    payload: {
      checked: visibleAssets[asset.key],
      onToggle: () => onToggle(asset.key),
    },
  }));

const LegendContent = ({ payload }) => (
  <div className="legend">
    {payload.map((entry) => (
      <label key={entry.id} className="legend-item">
        <input
          type="checkbox"
          checked={entry.payload.checked}
          onChange={entry.payload.onToggle}
        />
        <span className="legend-swatch" style={{ background: entry.color }} />
        {entry.value}
      </label>
    ))}
  </div>
);

export default function MultiAssetChart() {
  const [chartType, setChartType] = useState("line");
  const [series, setSeries] = useState(buildInitialSeries);
  const [visibleAssets, setVisibleAssets] = useState({
    stocks: true,
    bonds: true,
    crypto: true,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSeries((prev) => updateSeries(prev));
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  const legendPayload = useMemo(
    () => buildLegendPayload(visibleAssets, (key) =>
      setVisibleAssets((prev) => ({ ...prev, [key]: !prev[key] }))
    ),
    [visibleAssets]
  );

  const visibleKeys = assetConfig
    .filter((asset) => visibleAssets[asset.key])
    .map((asset) => asset.key);

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h3>Multi-Asset Chart Lab</h3>
          <p className="muted">
            Compare simulated stocks, bonds, and crypto in one chart.
          </p>
        </div>
        <div className="chart-type-toggle">
          {chartTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              className={chartType === type.value ? "primary" : "ghost"}
              onClick={() => setChartType(type.value)}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-container tall">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e8f0" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend content={<LegendContent />} payload={legendPayload} />
            {chartType === "line" &&
              assetConfig.map((asset) =>
                visibleAssets[asset.key] ? (
                  <Line
                    key={asset.key}
                    type="monotone"
                    dataKey={asset.key}
                    stroke={asset.color}
                    strokeWidth={3}
                    dot={false}
                  />
                ) : null
              )}
            {chartType === "bar" &&
              assetConfig.map((asset) =>
                visibleAssets[asset.key] ? (
                  <Bar
                    key={asset.key}
                    dataKey={asset.key}
                    fill={asset.color}
                    barSize={18}
                  />
                ) : null
              )}
            {chartType === "candlestick" && (
              <Customized
                component={({ xAxisMap, yAxisMap }) => {
                  const xScale = Object.values(xAxisMap || {})[0]?.scale;
                  if (!xScale) return null;
                  return (
                    <CandleLayer
                      points={series.map((entry) => ({
                        ...entry,
                        __x: xScale(entry.time),
                      }))}
                      yAxisMap={yAxisMap}
                      visibleAssets={visibleAssets}
                    />
                  );
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-hint">
        {visibleKeys.length
          ? `Visible: ${visibleKeys.join(", ")}`
          : "Toggle an asset to display data."}
      </div>
    </section>
  );
}
