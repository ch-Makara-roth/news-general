"use client";

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Article, NewsApiResponse } from "@/lib/types";
import NewsList from "./NewsList"; // Re-use NewsList for displaying related articles
import { getAIRelatedArticles } from '@/actions/newsActions';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface MoreLikeThisModalRef {
  openModal: (article: Article) => void;
}

const MoreLikeThisModal = forwardRef<MoreLikeThisModalRef>((_props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [relatedArticlesResponse, setRelatedArticlesResponse] = useState<NewsApiResponse | undefined>(undefined);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const { toast } = useToast();

  useImperativeHandle(ref, () => ({
    openModal: (article) => {
      setCurrentArticle(article);
      setIsOpen(true);
      fetchRelatedArticles(article);
    },
  }));

  const fetchRelatedArticles = async (article: Article) => {
    if (!article) return;
    setLoadingRelated(true);
    setRelatedArticlesResponse(undefined); // Clear previous results
    try {
      const response = await getAIRelatedArticles(article.title, article.content, article.url);
       if (response.status === 'error') {
           toast({
            title: "AI Suggestions Error",
            description: response.message || "Could not load related articles.",
            variant: "destructive",
          });
        }
      setRelatedArticlesResponse(response);
    } catch (error) {
      console.error("Error fetching AI related articles:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error fetching related articles.";
      setRelatedArticlesResponse({ status: "error", message: errorMessage });
      toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
      });
    }
    setLoadingRelated(false);
  };

  const closeModal = () => {
    setIsOpen(false);
    setCurrentArticle(null);
    setRelatedArticlesResponse(undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[50vw] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <Sparkles className="h-6 w-6 text-accent" />
            More Like: "{currentArticle?.title}"
          </DialogTitle>
          <DialogDescription>
            AI powered suggestions for articles similar to the one you selected.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto pr-2 py-4">
          <NewsList response={relatedArticlesResponse} loading={loadingRelated} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

MoreLikeThisModal.displayName = "MoreLikeThisModal";
export default MoreLikeThisModal;
