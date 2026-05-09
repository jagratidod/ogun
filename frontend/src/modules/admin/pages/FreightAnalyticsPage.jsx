import React, { useState, useEffect } from 'react';
import { 
  RiCalculatorLine, 
  RiTruckLine, 
  RiPriceTag3Line,
  RiPieChartLine,
  RiArrowRightUpLine,
  RiBox3Line,
  RiScalesLine
} from 'react-icons/ri';
import { 
  PageHeader, Card, CardHeader, CardTitle, CardDescription, 
  Button, Input, Select, Badge, DataTable 
} from '../../../core';
import carrierService from '../../../core/services/carrierService';
import { toast } from 'react-hot-toast';

export default function FreightAnalyticsPage() {
  const [calcForm, setCalcForm] = useState({
    weight: '',
    length: '',
    width: '',
    height: '',
    zone: ''
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (!calcForm.weight || !calcForm.length || !calcForm.width || !calcForm.height || !calcForm.zone) {
      return toast.error('Please fill all calculation parameters');
    }

    try {
      setLoading(true);
      const res = await carrierService.calculateFreight(calcForm);
      if (res.success) {
        setResults(res.data);
        toast.success('Freight options calculated');
      }
    } catch (error) {
      toast.error('Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Freight Intelligence & Analytics" 
        subtitle="Optimize logistics costs using the OGUN Rate Engine and carrier benchmarking"
      >
        <Button variant="secondary" icon={RiPieChartLine}>Export Analysis</Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Rate Engine Calculator */}
        <Card className="lg:col-span-1 border-t-4 border-brand-teal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiCalculatorLine className="text-brand-teal" /> Rate Engine
            </CardTitle>
            <CardDescription>Calculate shipping costs for specific shipments</CardDescription>
          </CardHeader>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Weight (Kg)" 
                type="number" 
                value={calcForm.weight}
                onChange={(e) => setCalcForm(p => ({ ...p, weight: e.target.value }))}
              />
              <Select 
                label="Destination Zone"
                options={[
                  { label: 'Select Zone', value: '' },
                  { label: 'North', value: 'North' },
                  { label: 'West', value: 'West' },
                  { label: 'East', value: 'East' },
                  { label: 'South', value: 'South' }
                ]}
                value={calcForm.zone}
                onChange={(e) => setCalcForm(p => ({ ...p, zone: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input 
                label="L (cm)" 
                type="number" 
                value={calcForm.length}
                onChange={(e) => setCalcForm(p => ({ ...p, length: e.target.value }))}
              />
              <Input 
                label="W (cm)" 
                type="number" 
                value={calcForm.width}
                onChange={(e) => setCalcForm(p => ({ ...p, width: e.target.value }))}
              />
              <Input 
                label="H (cm)" 
                type="number" 
                value={calcForm.height}
                onChange={(e) => setCalcForm(p => ({ ...p, height: e.target.value }))}
              />
            </div>
            <Button className="w-full mt-4" onClick={handleCalculate} loading={loading}>Run Intelligence Engine</Button>
          </div>
        </Card>

        {/* Calculation Results */}
        <Card className="lg:col-span-2">
          {results ? (
            <>
              <CardHeader className="bg-surface-secondary/30">
                <div className="flex justify-between items-center w-full">
                  <div>
                    <CardTitle>Calculation Insights</CardTitle>
                    <CardDescription>Carrier benchmarks for {calcForm.weight}kg package to {calcForm.zone}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-content-tertiary uppercase font-black">Billed Weight</p>
                    <h3 className="text-2xl font-black text-brand-teal">{results.metrics?.billedWeight?.toFixed(2)} Kg</h3>
                  </div>
                </div>
              </CardHeader>
              <div className="p-0 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-surface-secondary text-[10px] text-content-tertiary uppercase font-black tracking-widest border-b border-border">
                    <tr>
                      <th className="px-6 py-4">Carrier</th>
                      <th className="px-6 py-4">SLA</th>
                      <th className="px-6 py-4">Cost (₹)</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {results.recommendations.map((rec, i) => (
                      <tr key={i} className={`hover:bg-surface-secondary/20 ${i === 0 ? 'bg-brand-teal/5' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <RiTruckLine className="text-brand-teal" />
                            <div>
                              <p className="text-sm font-bold text-content-primary">{rec.name}</p>
                              <p className="text-[10px] text-content-tertiary">{rec.type}</p>
                            </div>
                            {i === 0 && <Badge variant="teal" className="text-[8px]">Best Value</Badge>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium">{rec.sla} Days</td>
                        <td className="px-6 py-4 text-sm font-black text-content-primary">₹ {rec.cost.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <Button variant="ghost" size="xs">Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-surface-secondary/50 flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-1 text-[10px] text-content-tertiary">
                    <RiBox3Line /> Actual: {calcForm.weight}kg
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-content-tertiary">
                    <RiScalesLine /> Volumetric: {results.metrics?.volumetricWeight?.toFixed(2)}kg
                  </div>
                </div>
                <p className="text-[10px] italic text-content-tertiary">* Formula: (L×W×H)/5000</p>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-40">
              <RiCalculatorLine className="w-16 h-16 mb-4 text-content-tertiary" />
              <h3 className="text-lg font-bold">Awaiting Input</h3>
              <p className="text-sm max-w-xs mx-auto">Fill the parameters on the left to see carrier recommendations and cost analysis.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Historical Analytics Charts Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Logistics Spending</CardTitle>
            <CardDescription>Monthly freight expenditure trend</CardDescription>
          </CardHeader>
          <div className="p-12 text-center">
            <RiPieChartLine className="w-12 h-12 text-content-tertiary mx-auto mb-2 opacity-20" />
            <p className="text-xs text-content-tertiary">Spending visualization will appear as shipment data accumulates.</p>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Carrier Reliability</CardTitle>
            <CardDescription>SLA compliance by provider</CardDescription>
          </CardHeader>
          <div className="p-12 text-center">
            <RiArrowRightUpLine className="w-12 h-12 text-content-tertiary mx-auto mb-2 opacity-20" />
            <p className="text-xs text-content-tertiary">Performance metrics will appear as deliveries are completed.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
