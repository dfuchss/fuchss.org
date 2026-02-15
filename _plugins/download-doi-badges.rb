require 'net/http'
require 'uri'
require 'fileutils'

module Jekyll
  module DoiBadges
    class Generator < Jekyll::Generator
      safe true
      priority :lowest

      def generate(site)
        # Store the site object for later use
        site.config['doi_badges_site'] = site
      end
    end

    Jekyll::Hooks.register :site, :post_write do |site|
      # Get the zenodo_repos from the data file
      zenodo_repos = site.data['repositories']['zenodo_repos'] rescue nil
      
      Jekyll.logger.info "DOI Badges:", "Post-write hook triggered"
      Jekyll.logger.info "DOI Badges:", "Site destination: #{site.dest}"
      
      unless zenodo_repos && !zenodo_repos.empty?
        Jekyll.logger.warn "DOI Badges:", "No zenodo_repos found in data"
        next
      end

      # Create the output directory in the build destination
      badges_dir = File.join(site.dest, 'assets', 'img', 'badges')
      Jekyll.logger.info "DOI Badges:", "Creating badges directory: #{badges_dir}"
      FileUtils.mkdir_p(badges_dir)

      Jekyll.logger.info "DOI Badges:", "Downloading badges for #{zenodo_repos.length} repositories..."

      zenodo_repos.each do |repo|
        doi = repo['doi']
        if doi
          download_badge(doi, badges_dir)
        else
          Jekyll.logger.warn "DOI Badges:", "Repository '#{repo['name']}' has no DOI"
        end
      end

      Jekyll.logger.info "DOI Badges:", "Download complete!"
      Jekyll.logger.info "DOI Badges:", "Badges saved to: #{badges_dir}"
    end

    def self.download_badge(doi, output_dir)
      # Create the Zenodo badge URL
      badge_url = "https://zenodo.org/badge/DOI/#{doi}.svg"
      
      # Create safe filename
      filename = "doi-#{sanitize_filename(doi)}.svg"
      output_path = File.join(output_dir, filename)

      Jekyll.logger.debug "DOI Badges:", "Processing DOI: #{doi}"
      Jekyll.logger.debug "DOI Badges:", "Badge URL: #{badge_url}"
      Jekyll.logger.debug "DOI Badges:", "Output path: #{output_path}"

      # Skip if already exists
      if File.exist?(output_path)
        Jekyll.logger.debug "DOI Badges:", "Skipping #{doi} (already exists)"
        return
      end

      begin
        uri = URI.parse(badge_url)
        response = Net::HTTP.get_response(uri)

        if response.is_a?(Net::HTTPSuccess)
          File.write(output_path, response.body)
          Jekyll.logger.info "DOI Badges:", "✓ Downloaded badge for #{doi} -> #{filename}"
        else
          Jekyll.logger.warn "DOI Badges:", "Failed to download badge for #{doi}: HTTP #{response.code}"
        end
      rescue => e
        Jekyll.logger.error "DOI Badges:", "Error downloading badge for #{doi}: #{e.message}"
      end
    end

    def self.sanitize_filename(doi)
      doi.gsub(/[\/\.]/, '_')
    end
  end
end
