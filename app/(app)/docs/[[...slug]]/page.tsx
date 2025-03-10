import { notFound } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

import "@/styles/mdx.css";
import type { Metadata } from "next";
// import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";
// import Balancer from "react-wrap-balancer";

import { siteConfig } from "@/config/site";
import { getTableOfContents } from "@/lib/toc";
import { absoluteUrl, cn } from "@/lib/utils";
// import { Mdx } from "@/components/mdx-components";
// import { OpenInV0Cta } from "@/components/open-in-v0-cta";
// import { DocsPager } from "@/components/pager";
// import { DashboardTableOfContents } from "@/components/toc";
// import { badgeVariants } from "@/registry/new-york/ui/badge";

interface TableOfContentsItem {
  title: string;
  url: string;
  items?: TableOfContentsItem[];
}

interface Doc {
  slugAsParams: string;
  title: string;
  description?: string;
  body: { raw: string; code: string };
  links?: { doc?: string; api?: string };
  slug: string;
  toc?: TableOfContentsItem[];
}

interface DocPageProps {
  params: {
    slug: string[];
  };
}

async function getAllDocs(): Promise<Doc[]> {
  const docsDirectory = path.join(process.cwd(), "docs");
  const filenames = await fs.readdir(docsDirectory);

  const docs = await Promise.all(
    filenames.map(async (filename) => {
      const filePath = path.join(docsDirectory, filename);
      const fileContents = await fs.readFile(filePath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        slugAsParams: filename.replace(/\.mdx?$/, ""),
        title: data.title,
        description: data.description,
        body: { raw: content, code: content }, // 簡略化のため、codeはrawと同じにしています
        links: data.links,
        slug: `/${filename.replace(/\.mdx?$/, "")}`,
        toc: data.toc,
      };
    })
  );

  return docs;
}

const getDocFromParams = async ({ params }: DocPageProps) => {
  const slug = params.slug?.join("/") || "";
  const allDocs = await getAllDocs();
  const doc = allDocs.find((doc) => doc.slugAsParams === slug);

  if (!doc) {
    return null;
  }

  return doc;
};

export const generateMetadata = async ({
  params,
}: DocPageProps): Promise<Metadata> => {
  const doc = await getDocFromParams({ params });

  if (!doc) {
    return {};
  }

  return {
    title: doc.title,
    description: doc.description,
    openGraph: {
      title: doc.title,
      description: doc.description,
      type: "article",
      url: absoluteUrl(doc.slug),
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: doc.title,
      description: doc.description,
      images: [siteConfig.ogImage],
      creator: "@shadcn",
    },
  };
};

export const generateStaticParams = async (): Promise<
  DocPageProps["params"][]
> => {
  const allDocs = await getAllDocs();
  return allDocs.map((doc) => ({
    slug: doc.slugAsParams.split("/"),
  }));
};

export default async function DocPage({ params }: DocPageProps) {
  const doc = await getDocFromParams({ params });

  if (!doc) {
    notFound();
  }

  const toc = await getTableOfContents(doc.body.raw);

  return (
    <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
      <div className="mx-auto w-full min-w-0 max-w-2xl">
        <div className="mb-4 flex items-center space-x-1 text-sm leading-none text-muted-foreground">
          <div className="truncate">Docs</div>
          {/* <ChevronRight className="h-3.5 w-3.5" /> */}
          <div className="text-foreground">{doc.title}</div>
        </div>
        {/* <div className="space-y-2">
          <h1 className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
            {doc.title}
          </h1>
          {doc.description && (
            <p className="text-base text-muted-foreground">
              <Balancer>{doc.description}</Balancer>
            </p>
          )}
        </div>
        {doc.links ? (
          <div className="flex items-center space-x-2 pt-4">
            {doc.links?.doc && (
              <Link
                href={doc.links.doc}
                target="_blank"
                rel="noreferrer"
                className={cn(badgeVariants({ variant: "secondary" }), "gap-1")}
              >
                Docs
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
            {doc.links?.api && (
              <Link
                href={doc.links.api}
                target="_blank"
                rel="noreferrer"
                className={cn(badgeVariants({ variant: "secondary" }), "gap-1")}
              >
                API Reference
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        ) : null}
        <div className="pb-12 pt-8">
          <Mdx code={doc.body.code} />
        </div>
        <DocsPager doc={doc} />
      </div>
      <div className="hidden text-sm xl:block">
        <div className="sticky top-20 -mt-6 h-[calc(100vh-3.5rem)] pt-4">
          <div className="no-scrollbar h-full overflow-auto pb-10">
            {doc.toc && <DashboardTableOfContents toc={toc} />}
            <OpenInV0Cta className="mt-6 max-w-[80%]" />
          </div>
        </div> */}
      </div>
    </main>
  );
}
