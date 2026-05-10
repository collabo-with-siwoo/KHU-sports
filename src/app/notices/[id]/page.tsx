import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getPublishedNotice, getSeedNoticeStaticParams } from "@/lib/notices";

type NoticeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const revalidate = 60;

export function generateStaticParams() {
  return getSeedNoticeStaticParams();
}

export async function generateMetadata({ params }: NoticeDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const notice = await getPublishedNotice(id);

  return {
    title: notice ? `${notice.title} | KHU Sports Golf` : "공지사항 | KHU Sports Golf",
    description: notice?.summary
  };
}

export default async function NoticeDetailPage({ params }: NoticeDetailPageProps) {
  const { id } = await params;
  const notice = await getPublishedNotice(id);

  if (!notice) {
    notFound();
  }

  return (
    <main className="home-app">
      <Header currentPath="/notices" />

      <section className="stitch-page-canvas notice-detail">
        <Link className="notice-back-link" href="/notices">
          <span className="material-symbols-outlined">arrow_back</span>
          공지 목록
        </Link>

        <article className="notice-detail-card">
          <div className="notice-detail-meta">
            <span>{notice.category}</span>
            <time dateTime={notice.publishedAt}>{notice.publishedLabel}</time>
          </div>
          <h1>{notice.title}</h1>
          <div className="notice-detail-body" dangerouslySetInnerHTML={{ __html: notice.content }} />

          {notice.attachments.length > 0 && (
            <section className="notice-attachments" aria-label="첨부 파일">
              <h2>첨부 파일</h2>
              {notice.attachments.map((attachment) => (
                <a
                  aria-disabled={!attachment.url}
                  href={attachment.url ?? "#"}
                  key={attachment.id}
                >
                  <span className="material-symbols-outlined">attach_file</span>
                  <strong>{attachment.fileName}</strong>
                  <small>{Math.ceil(attachment.fileSize / 1024).toLocaleString("ko-KR")}KB</small>
                </a>
              ))}
            </section>
          )}
        </article>
      </section>

      <Footer />
    </main>
  );
}
