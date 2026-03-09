import React from "react";
import { ProjectRow } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";

interface PortfolioHealthCardProps {
  projects: ProjectRow[];
}

const PortfolioHealthCard: React.FC<PortfolioHealthCardProps> = ({ projects }) => {
  const data = projects.map(p => ({
    name: p.name,
    x: p.progress,
    y: p.spi,
    z: p.budget,
    status: p.status
  }));

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-base font-semibold">สถานะโครงการ (Project Health Matrix)</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Progress" 
                unit="%" 
                domain={[0, 100]} 
                label={{ value: 'Progress (%)', position: 'bottom', offset: 0 }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="SPI" 
                domain={[0, 2]} 
                label={{ value: 'SPI (Performance)', angle: -90, position: 'insideLeft' }}
              />
              <ZAxis type="number" dataKey="z" range={[50, 400]} name="Budget" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Projects" data={data} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(PortfolioHealthCard);
