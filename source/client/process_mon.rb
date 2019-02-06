require "open3"
require "logger"

logger = Logger.new(
  File.expand_path("../process_mon.log", __FILE__)
)

logger.info "monitor start"

def get_processes
  cmd = [
    "ps aux",
    "grep react-scripts",
    "grep start",
    "grep -v grep"
  ]

  out, err, status = Open3.capture3 cmd.join("|")
  out.split("\n")
end

processes = get_processes()

if processes.size === 0
  logger.error "process is dead. restart"
  logger.error processes

  root_path = File.expand_path "../", __FILE__
  Open3.capture3 "cd #{root_path} && npm start &"
else
  logger.info "process is alive"
  logger.info processes.map{|r| r.split(" ")[-2..-1].join(" ") }
end
