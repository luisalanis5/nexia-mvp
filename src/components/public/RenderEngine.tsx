'use client';

import React from 'react';
import QnAWidget from './QnAWidget';
import NativeAd from './NativeAd';
import LinksList from './LinksList';
import MediaEmbed from './MediaEmbed';
import TipWidget from './modules/TipWidget';
import PollWidget from './modules/PollWidget';
import ImageGallery from './modules/ImageGallery';
import NewsFeed from './modules/NewsFeed';
import LockedContent from './modules/LockedContent';

type LayoutBlock = {
    type: string;
    id: string;
    props: any;
};

type RenderEngineProps = {
    layout: LayoutBlock[];
    theme?: any; // Añadido para Theme Engine 2.0
};

const allowedComponents: Record<string, React.ElementType> = {
    qna: QnAWidget,
    nativeAd: NativeAd,
    links: LinksList,
    media: MediaEmbed,
    tip: TipWidget,
    poll: PollWidget,
    gallery: ImageGallery,
    feed: NewsFeed,
    locked: LockedContent,
};

export default function RenderEngine({ layout, theme }: RenderEngineProps) {
    if (!layout || layout.length === 0) return null;

    // Resolvemos clases tipográficas para el contenedor
    const fontThemeClass = theme?.fontMode === 'serif' ? 'font-serif' :
        theme?.fontMode === 'mono' ? 'font-mono' : 'font-sans';

    return (
        <div className={`w-full flex flex-col gap-6 mt-8 ${fontThemeClass}`}>
            {layout.map((block) => {
                const Component = allowedComponents[block.type];

                if (!Component) {
                    console.warn(`[RenderEngine] Tipo de módulo no reconocido: ${block.type}`);
                    return null;
                }

                // Renderizado Universal con Props Estándar (moduleId, creatorId, moduleData)
                return (
                    <Component
                        key={block.id}
                        theme={theme}
                        {...block.props}
                    />
                );
            })}
        </div>
    );
}
