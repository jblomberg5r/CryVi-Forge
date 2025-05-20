import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { TemplateMarketplace } from '@/components/TemplateMarketplace';
import { useQuery } from '@tanstack/react-query';

export default function TemplatesPage() {
  // Fetch projects (using mock user ID 1)
  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ['/api/projects/1'],
  });

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      
      <div className="flex-grow overflow-y-auto">
        <Topbar />
        
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Smart Contract Templates</h1>
          
          <div className="mb-6">
            <p className="text-muted-foreground">
              Browse our template library for ready-to-use smart contracts and tokens. Import templates directly into your projects and customize them to your needs.
            </p>
          </div>
          
          <TemplateMarketplace projectId={projects[0]?.id || 0} />
        </div>
      </div>
    </div>
  );
}