"use client";

import { useState } from "react";
import { ServiceCard } from "./ServiceCard";
import { PaymentModal } from "./PaymentModal";

const SERVICES = {
    online: {
        id: "online",
        title: "Online Audit",
        price: 50,
        description: "Self-guided questionnaire with automated report",
        features: [
            "Comprehensive online questionnaire",
            "Automated risk scoring",
            "Instant PDF report download",
            "Traffic light compliance indicators",
            "Actionable recommendations",
        ],
    },
    onsite: {
        id: "onsite",
        title: "Onsite Audit",
        price: 500,
        description: "In-person inspection by a qualified auditor",
        features: [
            "Everything in Online Audit",
            "Physical property inspection",
            "Face-to-face consultation",
            "Priority support",
            "Detailed photographic evidence",
            "Follow-up call within 7 days",
        ],
    },
} as const;

type ServiceId = keyof typeof SERVICES;

export function PricingSection() {
    const [selectedService, setSelectedService] = useState<ServiceId | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelectService = (serviceId: ServiceId) => {
        setSelectedService(serviceId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedService(null);
    };

    return (
        <section className="py-20 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-foreground mb-4">
                        Choose Your Audit Package
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Protect yourself from tenant disputes and ensure compliance with our
                        comprehensive landlord risk audits.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <ServiceCard
                        title={SERVICES.online.title}
                        price={SERVICES.online.price}
                        description={SERVICES.online.description}
                        features={SERVICES.online.features}
                        isPopular={true}
                        onSelect={() => handleSelectService("online")}
                    />
                    <ServiceCard
                        title={SERVICES.onsite.title}
                        price={SERVICES.onsite.price}
                        description={SERVICES.onsite.description}
                        features={SERVICES.onsite.features}
                        isPopular={false}
                        onSelect={() => handleSelectService("onsite")}
                    />
                </div>

                {/* Trust Badges */}
                <div className="mt-16 text-center">
                    <p className="text-sm text-muted-foreground mb-4">Trusted by landlords across the UK</p>
                    <div className="flex items-center justify-center gap-8 opacity-60">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <span className="text-sm font-medium">Secure Payments</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium">Money-back Guarantee</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {selectedService && (
                <PaymentModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    service={SERVICES[selectedService]}
                />
            )}
        </section>
    );
}
