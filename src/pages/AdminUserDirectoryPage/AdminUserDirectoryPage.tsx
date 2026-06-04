import {
  AdminSubNav,
  Button,
  Card,
  CardTitle,
  Divider,
  ErrorAlert,
  FieldInput,
  Muted,
  PageContent,
} from '../../components/ui'
import { useAdminUserDirectoryPage } from './useAdminUserDirectoryPage'
import { UserEditPanel } from './UserEditPanel'
import { userDirectoryRowClass } from './utils'

export const AdminUserDirectoryPage = () => {
  const {
    selectedId,
    qInput,
    setQInput,
    page,
    setPage,
    catalog,
    list,
    detail,
    isSelf,
    invalidateList,
    selectUser,
    onSearch,
    resetSearch,
  } = useAdminUserDirectoryPage()

  return (
    <PageContent>
      <Card>
        <AdminSubNav />

        <CardTitle>Користувачі</CardTitle>
        <Muted>Пошук за email або ім'ям, зміна ролей, блокування та скидання пароля.</Muted>

        <Divider />

        <form className="mb-4 flex flex-wrap gap-2" onSubmit={onSearch}>
          <FieldInput
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Пошук…"
            className="min-w-[200px] flex-[1_1_200px]"
          />
          <Button type="submit">Шукати</Button>
          <Button type="button" variant="secondary" onClick={resetSearch}>
            Скинути
          </Button>
        </form>

        {list.isError ? <ErrorAlert>{(list.error as Error).message}</ErrorAlert> : null}

        <div className="flex items-start max-[900px]:flex-col">
          <div className="min-w-0 flex-[1_1_0] max-[900px]:mb-6 max-[900px]:mr-0 mr-6">
            {list.isPending ? (
              <Muted>Завантаження…</Muted>
            ) : (
              <>
                <Muted className="mt-0">Знайдено: {list.data?.total ?? 0}</Muted>
                <div className="-mx-0.5 max-h-[min(520px,58vh)] overflow-y-auto px-0.5 py-1">
                  <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                    {(list.data?.items ?? []).map((u) => {
                      const selected = selectedId === u.id

                      return (
                        <li key={u.id}>
                          <button
                            type="button"
                            onClick={() => selectUser(u.id)}
                            className={userDirectoryRowClass(selected, u.blocked)}
                          >
                            <strong>{u.email}</strong>
                            {u.name ? <span className="text-muted"> · {u.name}</span> : null}
                            {u.blocked ? (
                              <span className="mt-1.5 inline-block rounded-md border border-red-200 bg-error-surface px-2 py-0.5 text-[0.75em] font-semibold uppercase tracking-wide text-error">
                                Заблоковано
                              </span>
                            ) : null}
                            <span className="mt-1 block text-[0.8em] text-muted">
                              {u.roles.map((r) => r.roleName).join(', ') || '—'}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
                {list.data && list.data.total > list.data.pageSize ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Назад
                    </Button>
                    <Muted>
                      Стор. {page} / {Math.ceil(list.data.total / list.data.pageSize)}
                    </Muted>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={page * list.data.pageSize >= list.data.total}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Далі
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div className="min-w-0 flex-[1.2_1_0]">
            {!selectedId ? (
              <Muted>Оберіть користувача зі списку.</Muted>
            ) : detail.isPending ? (
              <Muted>Завантаження профілю…</Muted>
            ) : detail.isError ? (
              <ErrorAlert>{(detail.error as Error).message}</ErrorAlert>
            ) : isSelf ? (
              <ErrorAlert>
                Неможливо редагувати власний обліковий запис у цьому інтерфейсі.
              </ErrorAlert>
            ) : catalog.isSuccess && detail.data ? (
              <UserEditPanel
                key={`${detail.data.id}-${detail.data.updatedAt}`}
                user={detail.data}
                rolesCatalog={catalog.data.roles}
                onInvalidateList={invalidateList}
              />
            ) : null}
          </div>
        </div>
      </Card>
    </PageContent>
  )
}
