import React from 'react';

import ClientOnly from './client';

export function generateStaticParams() {
  return [{ slug: ['DP1.00001.001'] }];
}

export default function Page() {
  return <ClientOnly />;
}


export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params // 'a', 'b', or 'c'
}