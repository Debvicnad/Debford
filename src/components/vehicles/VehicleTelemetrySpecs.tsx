interface VehicleSpecData {
  year?: number;
  make_name?: string;
  model_name?: string;
  variant_name?: string;
  condition?: string;
  mileage?: number;
  mileage_unit?: string;
  fuel_type?: string;
  transmission?: string;
  body_type?: string;
  color?: string;
  engine_size?: string;
  power_hp?: number;
  torque_nm?: number;
  acceleration_0_100?: string;
  top_speed_kmh?: number;
  drive_type?: string;
  vin?: string;
  doors?: number;
  seats?: number;
  curb_weight_kg?: number;
  fuel_consumption?: string;
  features?: { feature: string; category?: string }[];
}

interface VehicleTelemetrySpecsProps {
  vehicle: VehicleSpecData;
}

export function VehicleTelemetrySpecs({ vehicle }: VehicleTelemetrySpecsProps) {
  const specs = [
    {
      label: "Power Output",
      value: vehicle.power_hp ? `${vehicle.power_hp} HP` : "N/A",
      sub: "Peak Brake Horsepower",
      icon: "⚡",
    },
    {
      label: "Peak Torque",
      value: vehicle.torque_nm ? `${vehicle.torque_nm} Nm` : "N/A",
      sub: "Crankshaft Torque",
      icon: "⚙️",
    },
    {
      label: "Acceleration",
      value: vehicle.acceleration_0_100 ?? "—",
      sub: "0–100 km/h Sprint",
      icon: "⏱️",
    },
    {
      label: "Top Speed",
      value: vehicle.top_speed_kmh ? `${vehicle.top_speed_kmh} km/h` : "—",
      sub: "Governed Maximum",
      icon: "🏁",
    },
    {
      label: "Engine / Powertrain",
      value: vehicle.engine_size
        ? `${vehicle.engine_size}L ${vehicle.fuel_type ?? ""}`
        : vehicle.fuel_type ?? "Combustion",
      sub: "Engine Configuration",
      icon: "🔥",
    },
    {
      label: "Transmission",
      value: vehicle.transmission ?? "Automatic",
      sub: "Gearbox Architecture",
      icon: "🕹️",
    },
    {
      label: "Drivetrain",
      value: vehicle.drive_type?.toUpperCase() ?? "AWD",
      sub: "Drive Layout",
      icon: "🧭",
    },
    {
      label: "Odometer",
      value: vehicle.mileage
        ? `${vehicle.mileage.toLocaleString()} ${vehicle.mileage_unit ?? "km"}`
        : "Low Mileage",
      sub: "Verified Verified Distance",
      icon: "📍",
    },
    {
      label: "Curb Weight",
      value: vehicle.curb_weight_kg ? `${vehicle.curb_weight_kg} kg` : "—",
      sub: "Unladen Weight",
      icon: "⚖️",
    },
    {
      label: "Fuel / Energy",
      value: vehicle.fuel_consumption ?? vehicle.fuel_type ?? "Standard",
      sub: "Combined Cycle",
      icon: "⛽",
    },
    {
      label: "Chassis & Doors",
      value: `${vehicle.doors ?? 4} Doors · ${vehicle.seats ?? 5} Seats`,
      sub: vehicle.body_type ?? "Vehicle",
      icon: "🚪",
    },
    {
      label: "Exterior Finish",
      value: vehicle.color ?? "Factory OEM",
      sub: "Body Paintwork",
      icon: "🎨",
    },
  ];

  // Group features by category
  const featuresByCategory = (vehicle.features ?? []).reduce<Record<string, string[]>>(
    (acc, f) => {
      const cat = f.category || "General Features";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(f.feature);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-8">
      {/* Telemetry Matrix Grid */}
      <div className="bg-slate-900/60 rounded-2xl md:rounded-3xl border border-white/8 p-6 md:p-8 backdrop-blur-md">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-4 border-b border-white/8">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold mb-0.5">
              Engineering Telemetry
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
              12-Point Technical Specifications
            </h3>
          </div>
          {vehicle.vin && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
              <span className="text-slate-500">VIN:</span>
              <span className="font-bold text-cyan-400 tracking-wider">{vehicle.vin}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {specs.map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-xl bg-slate-950/70 border border-white/5 hover:border-white/15 transition-all group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span className="font-mono text-[11px] uppercase tracking-wider">{item.label}</span>
                <span className="opacity-60 group-hover:scale-110 transition-transform">{item.icon}</span>
              </div>
              <div className="text-base font-bold text-white group-hover:text-blue-400 transition-colors font-mono truncate">
                {item.value}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 truncate">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment & Bespoke Features */}
      {Object.keys(featuresByCategory).length > 0 && (
        <div className="bg-slate-900/60 rounded-2xl md:rounded-3xl border border-white/8 p-6 md:p-8 backdrop-blur-md">
          <div className="mb-6 pb-4 border-b border-white/8">
            <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold mb-0.5">
              Bespoke Configuration
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Installed Equipment & Factory Packages
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.entries(featuresByCategory).map(([category, items]) => (
              <div key={category} className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>{category}</span>
                </h4>
                <ul className="space-y-2">
                  {items.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-2.5 text-xs text-slate-300 bg-white/[0.02] p-2.5 rounded-xl border border-white/5"
                    >
                      <span className="text-emerald-400 font-bold text-xs mt-0.5">✓</span>
                      <span className="leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
