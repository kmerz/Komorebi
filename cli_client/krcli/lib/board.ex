defmodule Krcli.Board do
  defstruct [:id, :name, :columns, :stories]

  use FN, url: "/boards", name: "Board"

  defmodule Print do
    def board(board) do
      IO.puts "Board is called: " <> board.name
    end

    def board_inline(board) do
      :io.format("~3B : ~-15s\n", [board["id"], board["name"]])
    end

    def print_story_at(stories, colid, cnt) do
      if x=Enum.at(stories[colid], cnt) do
        case x do
          %Krcli.Task{} -> :io.format(IO.ANSI.cyan() <> "TA: ~-20s (~3B)"<>IO.ANSI.reset()<>"|",
            [x.name || "", x.id])
          _ -> :io.format(IO.ANSI.green() <> "ST: ~-20s (~3B)"<>IO.ANSI.reset()<>"|",
            [x.name || "", x.id])
        end
      else
        :io.format("~30s|", [""])
      end
    end

    def max_depth_in_stories(stories) do
      Enum.reduce(stories, 0, fn(val, acc) ->
        if (length(elem(val, 1)) > acc), do: length(elem(val, 1)) , else: acc end)
    end

    def story_line_by_column(cnt, board, stories) do
      :io.format("|")
      Enum.each(board.columns,
        fn(col) -> print_story_at(stories, col.id, cnt) end) |> Util.no_args(&IO.puts/1, "")
    end

    def story_tasks_by_column(board) do
      # Enum.reduce(board.stories, [], fn(story, acc) ->
      #   with nacc <- [story.name <> " " <> story.id],
      #        nline <- Enum.reduce(board.columns, nacc, fn(col, acc_1) ->
      #           Enum.reduce(board.tasks, acc_1, fn(task, acc_2) ->
      #             if task.column_id == col.id and task.story_id = story.id,
      #             do: acc_2 ++ [task.name]
      #           end)
      #         end),
      #   do: acc ++ [nline]
      # end)
    end

    def stories_by_column(stories, board) do
      # with len, cols <- story_and_tasks_per_column(board),
      # do:
      # Krcli.Table.p_base_table(
      #   Krcli.Table.create(%{columns: length(board.columns), width: 20, lines: cols,
      #     headers: board.columns, data: tasks_and_stories(board) })
      # )
      # IO.puts("-" <> String.duplicate("-", length(board.columns)*31))
      # :io.format("|"<> String.duplicate("~-30s|", length(board.columns)) <> "\n",
      #   Enum.map(board.columns, fn(x) -> x.name end))
      # IO.puts("-" <> String.duplicate("-", length(board.columns)*31))
      # Enum.map(0..max_depth_in_stories(stories)-1,
      #   fn(cnt) -> story_line_by_column(cnt, board, stories) end) |> Util.good
      # IO.puts("-" <> String.duplicate("-", length(board.columns)*31))
    end
  end

  def parse(input) do
    with {:ok, json} <- input, {:ok, brd} <- JSX.decode(json),
    do: {:ok, from_hash(brd)}
  end

  def from_hash(brd) do
    with cols = Enum.map(brd["columns"] || [], &Krcli.Column.parse/1)
      |> Krcli.Column.sort,
      stories = Enum.map(brd["stories"] || [], &Krcli.Story.parse/1),
    do: %Krcli.Board{id: brd["id"], name: brd["name"], columns: cols, stories: stories}
  end

  def with_column(board, item, fun) do
    with {:ok, board} <- fetch(board.name),
      val = Enum.find(board.columns, :error, Util.ln_cmp(item, &(&1.name))),
    do:
      if val == :error, do: {:error, "could not find " <> type_name()},
      else: fun.(val)
  end

  def create_board(data) do
    with {:ok, json} <- data,
      {:ok, result} <- SbServer.post_json("/boards", json),
      do: Util.success?(result)
  end

  def create(nname) do
    JSX.encode(%{name: nname})
    |> create_board
    |> Util.comply!("Board " <> nname <> " successfully created.")
  end

  def with_structure(board, fun) do
    with_item(board, &(fun.(&1)))
  end

  def with_structure(board, column, fun) do
    with_structure(board, fn(b) ->
      Krcli.Column.with_item(b.name, column, &fun.(b, &1))
    end)
  end

  def with_structure(board, column, story, fun) do
    with_structure(board, column, fn(b, c) ->
      Krcli.Story.with_item(story, &fun.(b, c, &1))
    end)
  end

  def create_column(nname, board) do
    with_structure(board, &(Krcli.Column.create(nname, &1.id)))
  end

  def create_story(board, column) do
    with_structure(board, column, &(Krcli.Story.create(&1, &2)))
  end

  def create_task(board, column, story) do
    with_structure(board, column, story, &(Krcli.Task.create(&1, &2, &3)))
  end

  def story_tasks_by_column(col) do
    (Krcli.Story.by_column(col) |> Util.unwrap) ++
    (Krcli.Task.by_column(col) |> Util.unwrap)
  end

  def stories_for_board(board) do
    Enum.reduce(board.columns, %{},
      fn(col, acc) ->
        Map.put_new(acc, col.id, story_tasks_by_column(col))
      end)
  end

  def stories_per_column(board) do
    stories_for_board(board) |> Print.stories_by_column(board)
  end

  defp show_board(input) do
    with {:ok, board} <- input,
      :ok <- Print.board(board),
      :ok <- stories_per_column(board),
    do: Util.wrap([])
  end

  def show_boards(arg) do
    case arg do
      {:ok, boards} ->
        Enum.map(boards, fn(b) -> Print.board_inline(b) end) |> Util.good
      {:error, err} -> raise err
    end
  end

  def destroy_column(column, board) do
    with_item(board, &(Krcli.Column.destroy(column, &1) |> Util.comply_good))
  end

  def list do
    all_json() |> show_boards |> Util.comply_good
  end

  def fetch(name) do
    SbServer.get_json("/" <> name) |> parse
  end

  def display(boardname) do
    fetch(boardname) |> show_board |> Util.comply_good
  end
end
