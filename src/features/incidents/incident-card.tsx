import { MediaFrame } from "@/components/media/media-frame";
import { MediaThumb } from "@/components/media/media-thumb";
import { ShareBar } from "@/components/primitives/share-bar";
import { StatusBadge } from "@/components/primitives/status-badge";
import { IncidentPoll } from "@/components/community";
import { OfficialResponse } from "@/features/incidents/official-response";
import { ResearchDrawer } from "@/features/incidents/research-drawer";
import { incidentMedia, type Incident } from "@/data/incidents";
import { formatDate } from "@/lib/incident-stats";

/**
 * One incident, in one of two presentations.
 *
 * These were two separate blocks of JSX inside the home route — the featured
 * report at the top and the log cards below it — and they had already drifted:
 * different heading sizes, different metadata, one showing location and the
 * other a file number. Same content, two implementations, neither obviously
 * canonical.
 *
 * `featured` leads with the full media player and a share bar; `log` leads
 * with a file number, loads media on click, and carries the poll and the
 * research drawer.
 *
 * Not yet named ContentCard (as ADR-0001 step 3 anticipated) because there is
 * still only one content type. Generalizing against a second shape that does
 * not exist would be guesswork; an article card wants a byline, a dek and a
 * reading time, and none of those are knowable until one is written.
 */

type Props = {
  incident: Incident;
  variant: "featured" | "log";
  /** `log` only: the descending file number shown in the header. */
  fileNumber?: number;
  /** `featured` only: the text the share buttons carry. */
  shareTitle?: string;
};

export function IncidentCard({ incident, variant, fileNumber, shareTitle }: Props) {
  return variant === "featured" ? (
    <article className="border border-border bg-card shadow-sm">
      <MediaFrame media={incidentMedia(incident)} />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={incident.status} />
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {formatDate(incident.date)}
            {incident.location ? ` · ${incident.location}` : ""}
          </span>
        </div>
        <h3 className="font-display text-2xl font-bold leading-tight">{incident.title}</h3>
        <p className="leading-relaxed text-muted-foreground">{incident.summary}</p>
        {incident.source && (
          <a
            href={incident.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-semibold text-accent underline underline-offset-4"
          >
            Source: {incident.source.label} ↗
          </a>
        )}

        {incident.defense && (
          <div className="border-t border-border pt-4">
            <OfficialResponse text={incident.defense} />
          </div>
        )}

        {shareTitle && <ShareBar title={shareTitle} />}
      </div>
    </article>
  ) : (
    <article
      id={`incident-${incident.slug}`}
      className="scroll-mt-20 overflow-hidden border border-border bg-card shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-primary/35 hover:shadow-md"
    >
      {/* Header: file number, status, date */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {fileNumber !== undefined && (
            <span className="border border-border bg-muted px-2 py-1 font-display text-[11px] font-bold tabular-nums tracking-wider">
              FILE №{String(fileNumber).padStart(3, "0")}
            </span>
          )}
          <StatusBadge status={incident.status} />
        </div>
        <time
          dateTime={incident.date}
          className="max-w-32 text-right text-[11px] font-semibold uppercase leading-relaxed tracking-[0.1em] text-muted-foreground sm:max-w-none sm:text-xs"
        >
          {incident.dateLabel ?? formatDate(incident.date)}
        </time>
      </div>

      <div className="px-4 pt-4 sm:px-5 sm:pt-5">
        <MediaThumb
          media={incidentMedia(incident)}
          sourceUrl={incident.source?.url}
          sourceLabel={incident.source?.label}
        />
      </div>

      <div className="px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold leading-snug">{incident.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{incident.summary}</p>
        </div>
      </div>

      {incident.defense && (
        <div className="border-t border-border px-4 py-4 sm:px-5">
          <OfficialResponse text={incident.defense} />
        </div>
      )}

      <div className="border-t border-border">
        <IncidentPoll incidentId={incident.slug} />
      </div>

      <ResearchDrawer
        established={incident.established}
        notes={incident.notes}
        references={incident.references}
        permalink={`#incident-${incident.slug}`}
        sourceUrl={incident.source?.url}
        sourceLabel={incident.source?.label}
      />
    </article>
  );
}
