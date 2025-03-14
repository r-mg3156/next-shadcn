"use client";

import { allDocs } from "contentlayer/generated";

import { Mdx } from "./mdx-components";

interface FrameworkDocsProps extends React.HTMLAttributes<HTMLDivElement> {
  data: string;
}

export const FrameworkDocs = ({ ...props }: FrameworkDocsProps) => {
  const frameworkDoc = allDocs.find(
    (doc) => doc.slug === `/docs/installation/${props.data}`
  );

  if (!frameworkDoc) {
    return null;
  }

  return <Mdx code={frameworkDoc.body.code} />;
};
