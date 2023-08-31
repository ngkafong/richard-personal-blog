import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import formatDate from '@/lib/utils/formatDate'
import milestones from '@/data/milestone'

import NewsletterForm from '@/components/NewsletterForm'

const MAX_DISPLAY = 5

export async function getStaticProps() {
  const posts = await getAllFilesFrontMatter('blog')

  return { props: { posts, milestones } }
}

function onToggleMilestone() {}
export default function Home({ posts, milestones }) {
  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="milestones">
          <h2 className="text-2xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl sm:leading-10 md:text-2xl md:leading-14">
            Milestones
          </h2>
          {Object.entries(milestones).map(([key, value]) => (
            <div key={key} className="mileston ">
              <div className="mb-4 flex ">
                <h3 className="font-bold">{key}</h3>
                {/* <button
                  type="button"
                  className="ml-1 mr-1 h-8 w-8 rounded py-1 sm:hidden"
                  aria-label="Toggle Menu"
                  onClick={onToggleMilestone}
                >
                  <svg
                    width={25}
                    height={25}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="text-gray-900 dark:text-gray-100"
                  >
                    <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </button> */}
              </div>
              <ol className="max-w-none border-l border-neutral-300 dark:border-neutral-500 md:flex md:justify-center md:gap-6 md:border-l-0 md:border-t">
                {value.map((item) => (
                  <li key={item.name}>
                    <div className="flex-start flex items-center pt-2 md:block md:pt-0">
                      <div
                        className={
                          '-ml-[10px] mr-3 flex h-[18px] w-[18px] rounded-full md:-mt-[10px] md:ml-0 md:mr-0 ' +
                          (item.pending ? 'bg-neutral-300' : item.color)
                        }
                      >
                        <span
                          className={
                            'relative inline-flex h-[18px] w-[18px] rounded-full ' +
                            (item.pending ? 'bg-neutral-300' : item.color + ' animate-ping')
                          }
                        ></span>
                      </div>
                      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-300">
                        {item.date}
                      </p>
                    </div>
                    <div className="ml-4 mt-2 pb-5 md:ml-0">
                      <h4
                        className={
                          'mb-1.5 text-xl font-semibold ' + (item.pending ? 'text-neutral-400' : '')
                        }
                      >
                        {item.name}
                      </h4>
                      {item.remarks && (
                        <p className={'text-sm ' + (item.pending ? 'text-neutral-400' : '')}>
                          ({item.remarks})
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        <div className="space-y-2 pt-6 pb-8 md:space-y-2">
          <h2 className="text-2xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl sm:leading-10 md:text-2xl md:leading-14">
            Latest
          </h2>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            {siteMetadata.description}
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && 'No posts found.'}
          {posts.slice(0, MAX_DISPLAY).map((frontMatter) => {
            const { slug, date, title, summary, tags } = frontMatter
            return (
              <li key={slug} className="py-12">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                        <time dateTime={date}>{formatDate(date)}</time>
                      </dd>
                    </dl>
                    <div className="space-y-5 xl:col-span-3">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold leading-8 tracking-tight">
                            <Link
                              href={`/blog/${slug}`}
                              className="text-gray-900 dark:text-gray-100"
                            >
                              {title}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags.map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose text-gray-500 dark:text-gray-400">{summary}</div>
                      </div>
                      <div className="text-base font-medium leading-6">
                        <Link
                          href={`/blog/${slug}`}
                          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                          aria-label={`Read "${title}"`}
                        >
                          Read more &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base font-medium leading-6">
          <Link
            href="/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="all posts"
          >
            All Posts &rarr;
          </Link>
        </div>
      )}
      {siteMetadata.newsletter.provider !== '' && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      )}
    </>
  )
}
