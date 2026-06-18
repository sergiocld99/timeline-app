type Props = {
  notes?: string
  title: string
  emptyNotesMsg: string
}

const NotesSection = ({ notes, title, emptyNotesMsg }: Props) => {
  return (
    <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
      <h4 className="font-semibold text-gray-500 dark:text-gray-400">{title}</h4>
      {notes ? (
        <p className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-gray-700 dark:text-gray-300 italic mt-1 border border-gray-100 dark:border-gray-800">
          {notes}
        </p>
      ) : (
        <p className="text-gray-400 dark:text-gray-500 italic mt-1">{emptyNotesMsg}</p>
      )}
    </div>
  )
}

export default NotesSection