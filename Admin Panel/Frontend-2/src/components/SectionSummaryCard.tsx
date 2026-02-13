import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface SectionSummaryCardProps {
    document?: {
        section_1_summary?: string;
        section_2_summary?: string;
        section_3_summary?: string;
    };
}

const SectionSummaryCard: React.FC<SectionSummaryCardProps> = ({ document }) => {
    const sections = [
        { title: 'Section 1', summary: document?.section_1_summary },
        { title: 'Section 2', summary: document?.section_2_summary },
        { title: 'Section 3', summary: document?.section_3_summary },
    ];

    return (
        <Card className="h-full border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
                <CardTitle>Section-wise Summary</CardTitle>
                <CardDescription>
                    AI-generated summary of key themes by section
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {sections.map((section, index) => (
                    <div key={index} className="space-y-2">
                        <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-1">
                            {section.title}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed text-justify">
                            {section.summary || "No summary available yet."}
                        </p>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default SectionSummaryCard;
