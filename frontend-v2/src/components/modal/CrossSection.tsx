import type { Cross } from "@/types/cross"

type Props = {
  crosses: Cross[]
  title: string
}

const CrossSection = ({ crosses, title }: Props) => {
  if (crosses.length === 0) {
    return null
  }

  return (
    <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
      <h4 className="font-semibold text-gray-500 dark:text-gray-400">{title}</h4>
      <div className="flex flex-wrap gap-1 mt-1">
        {crosses.map((c) => (
          <span key={c._id} className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs px-2 py-0.5 rounded">
            {c.name}
          </span>
        ))}
      </div>
    </div>
  )
}

export default CrossSection