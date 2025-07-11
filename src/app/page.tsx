import { SearchParams, type RawSearchParams } from "@/lib/router.ts";
import { listPostsAction } from "@/actions/post.ts";
import { listTagsAction } from "@/actions/post.ts";
import { perPage } from "@/config.ts";

import { Pagination } from "@/components/navigation/Pagination.tsx";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert.tsx";
import { UserHeader } from "@/components/layout/UserHeader.tsx";
import { PostItem, PostItemSkeleton } from "@/components/post/PostItem.tsx";
import { TagItem, TagItemSkeleton } from "@/components/post/TagItem.tsx";
import { Toggle } from "@/components/theme/Toggle.tsx";
import { Suspense } from "react";
import { Info } from "lucide-react";

type Props = {
  searchParams: Promise<RawSearchParams>;
};

export default async function Page({ searchParams }: Props) {
  const sp = SearchParams.fromRaw(await searchParams);
  const page = Number.parseInt(sp.getOne("page") || "1", 10);

  return (
    <>
      <header>
        <UserHeader trailing={<Toggle />} />
      </header>

      <main className="content pt-8 pb-12">
        <section>
          <Suspense fallback={<TagListSkeleton />}>
            <TagList />
          </Suspense>
        </section>

        <section className="pt-6">
          <Suspense fallback={<PostListSkeleton />}>
            <PostList page={page} />
          </Suspense>
        </section>
      </main>
    </>
  );
}

type PostListProps = {
  page: number;
};

async function PostList({ page }: PostListProps) {
  const { items, count } = await listPostsAction({
    pagination: {
      order: "desc",
      orderBy: "postedAt",
      limit: perPage,
      page,
    },
  });
  const totalPages = Math.ceil(count / perPage);

  return (
    <>
      {items.length > 0 && (
        <ul className="flex flex-col">
          {items.map((post) => (
            <li key={post.id} className="not-first:mt-4">
              <PostItem post={post} />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination totalPages={totalPages} />
        </div>
      )}

      {items.length === 0 && (
        <Alert>
          <Info />
          <AlertTitle>There are no posts yet.</AlertTitle>
          <AlertDescription>Let's post something on Bluesky!</AlertDescription>
        </Alert>
      )}
    </>
  );
}

function PostListSkeleton() {
  return (
    <div className="flex flex-col gap-3 md:gap-4">
      {Array.from({ length: 5 }, (_, i) => i).map((i) => (
        <PostItemSkeleton key={i} />
      ))}
    </div>
  );
}

async function TagList() {
  const { items } = await listTagsAction();

  return (
    <ul className="flex gap-2">
      {items.length > 0 &&
        items.map((tag) => (
          <li key={tag.id}>
            <TagItem tag={tag} />
          </li>
        ))}
    </ul>
  );
}

function TagListSkeleton() {
  return (
    <div className="flex gap-2">
      {Array.from({ length: 3 }, (_, i) => i).map((i) => (
        <TagItemSkeleton key={i} />
      ))}
    </div>
  );
}
