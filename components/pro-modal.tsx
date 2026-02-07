"use client";

import axios from "axios";
import { useState } from "react";
import { Check, Zap } from "lucide-react";
import { toast } from "react-hot-toast";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProModal } from "@/hooks/use-pro-modal";

export const ProModal = () => {
    const proModal = useProModal();
    const [loading, setLoading] = useState(false);

    const onSubscribe = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/stripe/checkout");

            window.location.href = response.data.url;
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex justify-center items-center flex-col gap-y-4 pb-2">
                        <div className="flex items-center gap-x-2 font-bold text-xl">
                            Upgrade to Ascended
                            <Badge variant="default" className="uppercase text-sm py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-0">
                                PRO
                            </Badge>
                        </div>
                    </DialogTitle>
                    <DialogDescription className="text-center pt-2 space-y-2 text-zinc-900 font-medium">
                        <div className="space-y-4">
                            <div className="p-3 border-black/5 flex items-center justify-between">
                                <div className="flex items-center gap-x-4">
                                    <div className="p-2 w-fit rounded-md bg-indigo-500/10">
                                        <Zap className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <div className="font-semibold text-sm text-left">
                                        Unlimited AI Coach
                                    </div>
                                </div>
                                <Check className="text-primary w-5 h-5" />
                            </div>
                            <div className="p-3 border-black/5 flex items-center justify-between">
                                <div className="flex items-center gap-x-4">
                                    <div className="p-2 w-fit rounded-md bg-purple-500/10">
                                        <Zap className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <div className="font-semibold text-sm text-left">
                                        Advanced Analytics
                                    </div>
                                </div>
                                <Check className="text-primary w-5 h-5" />
                            </div>
                            <div className="p-3 border-black/5 flex items-center justify-between">
                                <div className="flex items-center gap-x-4">
                                    <div className="p-2 w-fit rounded-md bg-pink-500/10">
                                        <Zap className="w-6 h-6 text-pink-500" />
                                    </div>
                                    <div className="font-semibold text-sm text-left">
                                        "Monk" Mode & Challenges
                                    </div>
                                </div>
                                <Check className="text-primary w-5 h-5" />
                            </div>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button disabled={loading} onClick={onSubscribe} size="lg" variant="default" className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-0">
                        Upgrade
                        <Zap className="w-4 h-4 ml-2 fill-white" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
