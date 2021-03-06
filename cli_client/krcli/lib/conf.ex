defmodule Conf do
   defstruct [:server, :board, :column, :home]

   def create(home) do
    with {:ok, state} <- ConfigParser.parse_file(Path.join(home, ".krclirc")),
      server <- ConfigParser.get(state, "general", "server_url") || "",
      board <- ConfigParser.get(state, "general", "default_board"),
      column <- ConfigParser.get(state, "general", "default_column"),
      do: %Conf{home: home, server: server, board: board, column: column}
   end

  def get_conf do
    home = System.get_env("HOME") || "/tmp"
    if File.exists?(Path.join(home, ".krclirc")), do: create(home),
      else: %Conf{home: home, server: "http://localhost:8080"}
  end

  def read_and_store_conf do
    with conf <- get_conf(),
      :ets.new(:config_storage, [:named_table]),
    do: :ets.insert(:config_storage, {:config, conf})
  end

  def current do
    case :ets.lookup(:config_storage, :config) do
      [config: conf] -> conf
    end
  end

  def with_config(item, fun) do
    if Map.get(current(), item, nil),
    do: fun.(Map.get(current(), item)),
    else: raise "Only available with configured #{item}"
  end

  def t_width do
    with {:ok, width} <- :io.columns,
    do: width-5
  end
end