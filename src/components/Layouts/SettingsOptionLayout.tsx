import { Book, BrainCircuit, Orbit, Share, BlocksIcon , InfoIcon} from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import { OllamaIcon } from "../Icons/Ollama"

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

const LinkComponent = (item: {
  href: string
  name: string
  icon: any
  current: string
}) => {
  return (
    <li>
      <Link
        to={item.href}
        className={classNames(
          item.current === item.href
            ? "bg-gray-100 text-gray-600 dark:bg-[#262626] dark:text-white"
            : "text-gray-700 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:text-white dark:hover:bg-[#262626]",
          "group flex gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm font-semibold"
        )}>
        <item.icon
          className={classNames(
            item.current === item.href
              ? "text-gray-600 dark:text-white"
              : "text-gray-400 group-hover:text-gray-600 dark:text-gray-200 dark:group-hover:text-white",
            "h-6 w-6 shrink-0"
          )}
          aria-hidden="true"
        />
        {item.name}
      </Link>
    </li>
  )
}

export const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()
  const { t } = useTranslation("settings")

  return (
    <>
      <div className="mx-auto max-w-7xl lg:flex lg:gap-x-16 lg:px-8">
        <aside className="flex lg:rounded-md bg-white lg:p-4 lg:mt-20 overflow-x-auto lg:border-0 border-b  py-4 lg:block lg:w-64 lg:flex-none  dark:bg-[#171717] dark:border-gray-600">
          <nav className="flex-none  px-4 sm:px-6 lg:px-0">
            <ul
              role="list"
              className="flex gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col">
              <LinkComponent
                href="/settings"
                name={t("generalSettings.title")}
                icon={Orbit}
                current={location.pathname}
              />
              <LinkComponent
                href="/settings/ollama"
                name={t("ollamaSettings.title")}
                icon={OllamaIcon}
                current={location.pathname}
              />
              <LinkComponent
                href="/settings/model"
                name={t("manageModels.title")}
                current={location.pathname}
                icon={BrainCircuit}
              />
               {/* <LinkComponent
                href="/settings/knowledge"
                name={t("manageKnowledge.title")}
                icon={BlocksIcon}
                current={location.pathname}
              /> */}
              <LinkComponent
                href="/settings/prompt"
                name={t("managePrompts.title")}
                icon={Book}
                current={location.pathname}
              />
              <LinkComponent
                href="/settings/share"
                name={t("manageShare.title")}
                icon={Share}
                current={location.pathname}
              />
              <LinkComponent
                href="/settings/about"
                name={t("about.title")}
                icon={InfoIcon}
                current={location.pathname}
              />
            </ul>
          </nav>
        </aside>

        <main className={"px-4 py-16 sm:px-6 lg:flex-auto lg:px-0 lg:py-20"}>
          <div className="mx-auto max-w-2xl space-y-16 sm:space-y-10 lg:mx-0 lg:max-w-none">
            {children}
          </div>
        </main>
      </div>
    </>
  )
}
