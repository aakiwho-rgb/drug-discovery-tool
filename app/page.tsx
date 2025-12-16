"use client";

import { useState, useEffect } from "react";
import {
    Activity,
    Beaker,
    CheckCircle2,
    AlertCircle,
    Zap,
    RefreshCcw,
    TestTube2,
    Dna,
    Server
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { PredictionResponse, ModelInfoResponse } from "@/types/api";

export default function Dashboard() {
    const [smiles, setSmiles] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PredictionResponse | null>(null);
    const [systemStatus, setSystemStatus] = useState<"online" | "offline">("offline");
    const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);

    // Active/Inactive Examples
    const ACTIVE_EXAMPLE = "COc1cc2c(cc1OC)pyrido[3,2-d]pyrimidin-4(3H)-one"; // Simplistic example
    const INACTIVE_EXAMPLE = "CC(=O)Oc1ccccc1C(=O)O"; // Aspirin (likely inactive for HER2)

    // Check System Status on Mount
    useEffect(() => {
        const checkHealth = async () => {
            try {
                const data = await api.checkHealth();
                setSystemStatus("online");

                // Also fetch model info if we are online and haven't loaded it yet
                if (!modelInfo) {
                    try {
                        const info = await api.getModelInfo();
                        setModelInfo(info);
                    } catch (e) {
                        console.error("Failed to load model info:", e);
                    }
                }
            } catch (error) {
                console.error("Health check failed:", error);
                setSystemStatus("offline");
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [modelInfo]);

    const handlePredict = async () => {
        if (!smiles.trim()) {
            toast.error("Please enter a valid SMILES string.");
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const data = await api.predict(smiles.trim());
            setResult(data);
            toast.success("Prediction complete!");
        } catch (error: any) {
            toast.error(error.message || "An error occurred during prediction.");
        } finally {
            setLoading(false);
        }
    };

    const handleRetrain = async () => {
        try {
            const data = await api.train();
            toast.info(data.message || "Training started.");
        } catch (error) {
            toast.error("Failed to trigger training.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="container flex h-16 items-center justify-between px-4 md:px-8 mx-auto max-w-7xl">
                    <div className="flex items-center gap-2">
                        <Dna className="h-6 w-6 text-blue-600" />
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">
                            HER2 Discovery Platform
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600 hidden md:inline-block">System Status:</span>
                        <Badge
                            variant="outline"
                            className={`gap-1.5 ${systemStatus === "online" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
                        >
                            <div className={`h-2 w-2 rounded-full ${systemStatus === "online" ? "bg-green-600 animate-pulse" : "bg-red-600"}`} />
                            {systemStatus === "online" ? "Online" : "Offline"}
                        </Badge>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-7xl p-4 md:p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Section A: The Input Lab */}
                    <section className="space-y-6">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-900">
                                    <TestTube2 className="h-5 w-5 text-blue-600" />
                                    Molecular Input
                                </CardTitle>
                                <CardDescription>
                                    Enter a SMILES string to analyze its potential as a HER2 inhibitor.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    placeholder="Enter SMILES string e.g., CC(=O)Oc1ccccc1C(=O)O"
                                    className="min-h-[150px] font-mono text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    value={smiles}
                                    onChange={(e) => setSmiles(e.target.value)}
                                />

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSmiles("COc1cc(Nc2c(cn[nH]2)C(=O)NCc2ccccc2)cc(OC)c1CN(C)C")} // Example active
                                        className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                    >
                                        Load Active Example
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSmiles(INACTIVE_EXAMPLE)}
                                        className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                    >
                                        Load Inactive Example
                                    </Button>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
                                    size="lg"
                                    onClick={handlePredict}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                                            Analyzing Structure...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="mr-2 h-4 w-4" />
                                            Run Prediction
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </section>

                    {/* Section B: The Results Engine */}
                    <section className="space-y-6">
                        {loading ? (
                            <Card className="border-slate-200 shadow-sm h-full flex flex-col justify-center p-8 space-y-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-8 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <Skeleton className="h-[200px] w-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </Card>
                        ) : result ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Verdict Card */}
                                <Card className={`border-2 shadow-md ${result.prediction === "Active"
                                    ? "border-green-500 bg-green-50/50"
                                    : "border-red-500 bg-red-50/50"
                                    }`}>
                                    <CardContent className="pt-6 flex flex-col items-center justify-center text-center p-8">
                                        {result.prediction === "Active" ? (
                                            <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
                                        ) : (
                                            <AlertCircle className="h-16 w-16 text-red-600 mb-4" />
                                        )}
                                        <h2 className={`text-3xl font-bold tracking-tight mb-2 ${result.prediction === "Active" ? "text-green-700" : "text-red-700"
                                            }`}>
                                            {result.prediction.toUpperCase()} CANDIDATE
                                        </h2>
                                        <p className="text-slate-600 font-medium">
                                            Confidence Score: {(result.confidence * 100).toFixed(1)}%
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Confidence Meter */}
                                <Card className="border-slate-200 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base text-slate-800">Probability Analysis</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Inhibition Probability</span>
                                                <span className="font-bold text-blue-700">{(result.probability * 100).toFixed(1)}%</span>
                                            </div>
                                            <Progress value={result.probability * 100} className="h-3" />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Cheminformatics Table */}
                                <Card className="border-slate-200 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                                            <Beaker className="h-4 w-4 text-purple-600" />
                                            Lipinski Descriptors
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Descriptor</TableHead>
                                                    <TableHead className="text-right">Value</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell className="font-medium">Molecular Weight</TableCell>
                                                    <TableCell className="text-right">{result.lipinski.MW} Da</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font-medium">LogP (Solubility)</TableCell>
                                                    <TableCell className="text-right">{result.lipinski.LogP}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font-medium">H-Bond Donors</TableCell>
                                                    <TableCell className="text-right">{result.lipinski.NumHDonors}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font-medium">H-Bond Acceptors</TableCell>
                                                    <TableCell className="text-right">{result.lipinski.NumHAcceptors}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <div className="text-center space-y-4">
                                    <Activity className="h-12 w-12 mx-auto opacity-50" />
                                    <p className="text-lg">Ready to analyze. Enter a molecule to begin.</p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Section C: Admin & Metadata */}
                <section className="pt-8 border-t border-slate-200">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="diagnostics" className="border-b-0">
                            <AccordionTrigger className="text-slate-600 hover:text-slate-900 hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <Server className="h-4 w-4" />
                                    <span>Model Diagnostics & Administration</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4">
                                <Card className="bg-slate-50 border-slate-200">
                                    <CardContent className="p-6 grid gap-6 md:grid-cols-2">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-sm text-slate-900 uppercase tracking-wider">Current Model Stats</h4>
                                            <dl className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <dt className="text-slate-500">Status</dt>
                                                    <dd className="font-medium text-slate-900 capitalize">{modelInfo?.status || "Unknown"}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-slate-500">Backend</dt>
                                                    <dd className="font-medium text-slate-900">Scikit-Learn (MLPClassifier)</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-slate-500">Training Date</dt>
                                                    <dd className="col-span-2 font-medium text-slate-900 truncate">
                                                        {modelInfo?.metadata?.training_date ? new Date(modelInfo.metadata.training_date).toLocaleString() : "N/A"}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>

                                        <div className="flex flex-col justify-end items-start md:items-end gap-2 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                                            <p className="text-xs text-slate-500 text-right mb-2">
                                                Triggering a retrain will run the full pipeline in the background.
                                            </p>
                                            <Button variant="destructive" onClick={handleRetrain}>
                                                Retrain Model
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </section>
            </main>
        </div>
    );
}