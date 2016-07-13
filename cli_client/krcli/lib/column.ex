defmodule Krcli.Column do
  defstruct [:id, :name, :position]

  def parse(col) do
    %Krcli.Column{ id: col["id"],
      name: col["name"], position: col["position"] }
  end

  def sort(input) do
    with {:ok, columns} <- input,
      sort_col = fn (a,b) -> a.position < b.position end,
      do: Util.wrap(Enum.sort(columns, sort_col))
  end

  # def create_column(data) do
  #   with {:ok, json} <- data,
  #     {:ok, json_result} <- SbServer.post_json("/columns", json),
  #     {:ok, result} <- JSX.decode(json_result),
  #     do:
  #       if result["success"], do: {:ok, ""},
  #         else: {:error, result["message"]}
  # end

  # def create(nname, board) do
  #   case JSX.encode(%{name: nname, position: pos, boardId: board}) |>
  #     create_column do
  #     {:ok, _} ->
  #       IO.puts("Board " <> nname <> " successfully created.") |> Util.good
  #     {:error, err} -> raise inspect(err)
  #     unexpected -> raise unexpected
  #   end
  # end

end